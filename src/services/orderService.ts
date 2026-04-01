// src/services/orderService.ts
// Data access layer — cache-first via IndexedDB + optimistic mutations via SyncQueue.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §7 Sync Strategy

import type { OrderDetail, DisputeResponsePayload } from '@/types/order.types';
import { MOCK_ORDER_MAP, MOCK_ORDER_IN_PROGRESS } from './MockData';
import { orderRepository, timeLogRepository, orderPhotoRepository, syncQueueRepository } from '@/db/repositories';
import {
  toLocalOrder,
  toLocalTimeLogEntry,
  toLocalOrderPhoto,
  fromLocalOrder,
  fromLocalTimeLogToTimeLog,
  fromLocalOrderPhoto,
} from '@/db/mappers';
import type { SyncQueueItem } from '@/types/db.types';

const delay = () => new Promise((r) => setTimeout(r, 600));

function makeSyncItem(
  partial: Omit<SyncQueueItem, 'id' | 'createdAt' | 'lastAttemptAt' | 'retryCount' | 'error'>
): SyncQueueItem {
  return {
    ...partial,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    lastAttemptAt: null,
    retryCount: 0,
    error: null,
  };
}

/**
 * Fetches full order details for the Order Hub.
 * Cache-first: reads from IndexedDB if TTL is fresh.
 * Cold start: fetches from API (mock), saves order + timeLogs + photos to DB.
 *
 * TODO (real API): Replace mock fetch with:
 *   fetch(`/api/v1/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchOrderById(id: string): Promise<OrderDetail> {
  const orderRepo = orderRepository.forOrder(id);
  const timeLogRepo = timeLogRepository.forOrder(id);

  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await orderRepo.isCacheFresh()) {
    const localOrder = await orderRepository.getById(id);
    if (localOrder) {
      console.debug('[orderService] Cache HIT for order', id);
      const localTimeLogs = await timeLogRepository.getByOrderId(id);
      const localPhotos = await orderPhotoRepository.getByOrderId(id);
      return fromLocalOrder(
        localOrder,
        localTimeLogs.map(fromLocalTimeLogToTimeLog),
        localPhotos.map(fromLocalOrderPhoto),
      );
    }
  }

  // ── Cache MISS — fetch from API (mock) ────────────────────────────────────
  console.debug('[orderService] Cache MISS — fetching order', id);
  await delay();
  const order = MOCK_ORDER_MAP[id] ?? MOCK_ORDER_IN_PROGRESS;

  // Persist order to DB
  await orderRepository.save(toLocalOrder(order));
  await orderRepo.markFetched();

  // Persist time logs (from the OrderDetail.timeLogs)
  if (order.timeLogs.length > 0) {
    await timeLogRepository.saveMany(
      order.timeLogs.map(tl => toLocalTimeLogEntry({
        id: tl.id,
        orderId: id,
        workerId: 'worker-001',
        logDate: tl.date,
        workStart: tl.workStart,
        workEnd: tl.workEnd,
        breaks: tl.breaks.map((b, i) => ({ id: `b-${i}`, breakStart: b.start, breakEnd: b.end })),
        netHours: tl.netHours,
        syncStatus: 'synced',
        unitsCompleted: tl.unitsCompleted,
      }))
    );
    await timeLogRepo.markFetched();
  }

  // Persist photos
  if (order.photos.length > 0) {
    await orderPhotoRepository.saveMany(
      order.photos.map(p => toLocalOrderPhoto(p, id))
    );
  }

  return order;
}

/**
 * Updates order status (optimistic UI + SyncQueue).
 * Status change is written to DB immediately; background sync flushes to API.
 */
export async function updateOrderStatus(
  id: string,
  action: 'start' | 'complete',
): Promise<{ status: string }> {
  const newStatus = action === 'start' ? 'in_progress' : 'checking';

  // ── Optimistic update to IndexedDB ─────────────────────────────────────────
  await orderRepository.updateStatus(id, newStatus as OrderDetail['status']);

  // Invalidate cache so next fetch re-reads from DB
  await orderRepository.forOrder(id).invalidateCache();

  // ── Enqueue to SyncQueue ───────────────────────────────────────────────────
  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'order',
    action: 'update',
    payload: { id, status: newStatus, action },
  }));

  console.debug('[orderService] Status updated optimistically:', id, '→', newStatus);
  return { status: newStatus };
}

/**
 * Uploads a photo to the order.
 * Saves to DB immediately with isSynced=false; enqueues upload to SyncQueue.
 */
export async function uploadOrderPhoto(
  orderId: string,
  file: File,
): Promise<{ id: string; url: string; thumbnailUrl: string }> {
  await delay();
  const blobUrl = URL.createObjectURL(file);
  const tempId = `temp-photo-${Date.now()}`;

  // Save to DB as pending upload
  await orderPhotoRepository.save({
    id: tempId,
    orderId,
    url: blobUrl,
    thumbnailUrl: blobUrl,
    uploadedAt: new Date().toISOString().split('T')[0],
    workerName: 'You',
    updatedAt: Date.now(),
    createdAt: Date.now(),
    isSynced: false,
    _localVersion: 1,
  });

  // Increment photo count on order
  await orderRepository.incrementPhotosToday(orderId);

  // Enqueue upload to SyncQueue
  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'orderPhoto',
    action: 'create',
    payload: { orderId, tempId, blobUrl },
  }));

  return { id: tempId, url: blobUrl, thumbnailUrl: blobUrl };
}

/**
 * Deletes a photo from the order.
 * Removes from DB immediately; enqueues DELETE to SyncQueue.
 */
export async function deleteOrderPhoto(
  orderId: string,
  photoId: string,
): Promise<void> {
  await delay();

  // Remove from DB
  await orderPhotoRepository.delete(photoId);
  await orderRepository.decrementPhotosToday(orderId);

  // If it was a temp (unsynced) photo, no need to enqueue — remove from SyncQueue instead
  const isTempPhoto = photoId.startsWith('temp-photo-');
  if (!isTempPhoto) {
    await syncQueueRepository.enqueue(makeSyncItem({
      entityType: 'orderPhoto',
      action: 'delete',
      payload: { orderId, photoId },
    }));
  }
}

/**
 * Submits Worker's response to a dispute.
 * Applies optimistic status update to DB; enqueues to SyncQueue.
 */
export async function submitDisputeResponse(
  id: string,
  payload: DisputeResponsePayload,
): Promise<void> {
  await delay();

  const newStatus = payload.action === 'accept' ? 'done' : 'dispute';
  await orderRepository.updateStatus(id, newStatus as OrderDetail['status']);
  await orderRepository.forOrder(id).invalidateCache();

  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'order',
    action: 'update',
    payload: { id, disputeAction: payload.action, explanation: payload.explanation },
  }));

  console.debug('[orderService] Dispute response enqueued:', id, payload.action);
}
