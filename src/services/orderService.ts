// src/services/orderService.ts
// Data access layer — cache-first via IndexedDB + real API mutations.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §7 Sync Strategy

import type { OrderDetail, DisputeResponsePayload } from '@/types/order.types';
import type { TaskStatus } from '@/types/task.types';
import {
  orderRepository,
  timeLogRepository,
  orderPhotoRepository,
  syncQueueRepository,
} from '@/db/repositories';
import {
  toLocalOrder,
  toLocalTimeLogEntry,
  fromLocalOrder,
  fromLocalTimeLogToTimeLog,
  fromLocalOrderPhoto,
} from '@/db/mappers';
import type { SyncQueueItem } from '@/types/db.types';
import { getOrder as apiGetOrder, signalWorkerStart, signalWorkerDone } from '@/api/ordersApi';
import type { OrderResponse } from '@/api/ordersApi';
import { getOrderTimelogs } from '@/api/timelogsApi';
import type { TimeLogResponse } from '@/api/timelogsApi';

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

// ─── API → domain mappers ─────────────────────────────────────────────────────

function mapApiStatusToUi(apiStatus: OrderResponse['status'], dueDate: string | null): TaskStatus {
  if (apiStatus === 'in_review') return 'checking';
  if (apiStatus === 'blocked') return 'in_progress';
  if ((apiStatus === 'new' || apiStatus === 'in_progress') && dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(dueDate) < today) return 'overdue';
  }
  return apiStatus as TaskStatus;
}

function mapApiOrderToOrderDetail(
  order: OrderResponse,
  timeLogs: TimeLogResponse[],
): OrderDetail {
  const status = mapApiStatusToUi(order.status, order.due_date ?? null);

  const canAddTime = ['new', 'in_progress', 'overdue'].includes(status);
  const canAddPhotos = status !== 'done';
  const canReportIssue = !['done', 'checking'].includes(status);

  let ctaAction: OrderDetail['ctaAction'] = null;
  if (status === 'new') ctaAction = 'start';
  else if (status === 'in_progress' || status === 'overdue') ctaAction = 'complete';

  const mappedLogs = timeLogs.map((tl) => ({
    id: tl.id,
    date: tl.work_date,
    netHours: tl.net_hours,
    workStart: tl.start_time?.slice(0, 5) ?? '00:00',
    workEnd: tl.end_time?.slice(0, 5) ?? '00:00',
    breaks: [] as Array<{ start: string; end: string }>,
    isOvertime: tl.overtime_hours > 0,
    overtimeHours: tl.overtime_hours || undefined,
    unitsCompleted: tl.quantity_done ?? undefined,
    isReadOnly: true,
  }));

  const totalHours = mappedLogs.reduce((sum, l) => sum + l.netHours, 0);

  return {
    id: order.id,
    number: order.order_number ?? order.id.slice(0, 6),
    name: order.title,
    status,
    deadline: order.due_date ?? order.order_date,
    amount: order.unit_rate_snapshot ?? 0,
    notes: order.notes ?? order.description ?? '',
    location: {
      address: order.address ?? '',
    },
    timeLogs: mappedLogs,
    totalHours,
    photos: [],            // photos fetched separately from IndexedDB
    photosAddedToday: 0,
    canAddTime,
    canAddPhotos,
    canReportIssue,
    ctaAction,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Fetches full order details for the Order Hub.
 * Cache-first: reads from IndexedDB if TTL is fresh.
 * Cold start: fetches from real API, saves order + timeLogs + photos to DB.
 *
 * REAL API: GET /orders/orders/{order_id} + GET /timelogs/orders/{order_id}/timelogs
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

  // ── Cache MISS — fetch from real API ──────────────────────────────────────
  console.debug('[orderService] Cache MISS — fetching order', id);

  const [orderResp, timelogsResp] = await Promise.all([
    apiGetOrder(id),
    getOrderTimelogs(id),
  ]);

  const order = mapApiOrderToOrderDetail(orderResp, timelogsResp.items);

  // Persist order to DB
  await orderRepository.save(toLocalOrder(order));
  await orderRepo.markFetched();

  // Persist time logs from API
  if (timelogsResp.items.length > 0) {
    await timeLogRepository.saveMany(
      timelogsResp.items.map((tl) => toLocalTimeLogEntry({
        id: tl.id,
        orderId: tl.order_id,
        workerId: tl.member_id,
        logDate: tl.work_date,
        workStart: tl.start_time?.slice(0, 5) ?? '00:00',
        workEnd: tl.end_time?.slice(0, 5) ?? '00:00',
        breaks: [],
        netHours: tl.net_hours,
        syncStatus: 'synced',
        unitsCompleted: tl.quantity_done ?? undefined,
      }))
    );
    await timeLogRepo.markFetched();
  }

  return order;
}

/**
 * Updates order status via real API.
 * start → POST /orders/orders/{id}/worker-start
 * complete → POST /orders/orders/{id}/worker-done
 *
 * On success: applies optimistic DB update + invalidates cache.
 */
export async function updateOrderStatus(
  id: string,
  action: 'start' | 'complete',
): Promise<{ status: string }> {
  if (action === 'start') {
    await signalWorkerStart(id);
  } else {
    await signalWorkerDone(id);
  }

  const newStatus = action === 'start' ? 'in_progress' : 'checking';

  // Apply optimistic update to DB + invalidate cache
  await orderRepository.updateStatus(id, newStatus as TaskStatus);
  await orderRepository.forOrder(id).invalidateCache();

  console.debug('[orderService] Status updated via API:', id, '→', newStatus);
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

  // Enqueue upload to SyncQueue (SyncService handles multipart upload)
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
  // Remove from DB
  await orderPhotoRepository.delete(photoId);
  await orderRepository.decrementPhotosToday(orderId);

  // If temp (unsynced), remove from SyncQueue instead
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
 * NOTE: Dispute response endpoint integration is Phase 2 (pending backend spec).
 */
export async function submitDisputeResponse(
  id: string,
  payload: DisputeResponsePayload,
): Promise<void> {
  const newStatus = payload.action === 'accept' ? 'done' : 'dispute';
  await orderRepository.updateStatus(id, newStatus as TaskStatus);
  await orderRepository.forOrder(id).invalidateCache();

  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'order',
    action: 'update',
    payload: { id, disputeAction: payload.action, explanation: payload.explanation },
  }));

  console.debug('[orderService] Dispute response enqueued:', id, payload.action);
}
