// src/services/leaveService.ts
// Data access layer — cache-first via IndexedDB + optimistic mutations via SyncQueue.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §8 Caching Strategy

import { MOCK_LEAVE_REQUESTS, MOCK_LEAVE_TYPES } from './MockData';
import type { LeaveRequest, LeaveType, CalendarDot } from '@/types/leave.types';
import {
  leaveRequestRepository,
  leaveTypeRepository,
  syncQueueRepository,
} from '@/db/repositories';
import {
  toLocalLeaveRequest,
  toLocalLeaveType,
  fromLocalLeaveRequest,
  fromLocalLeaveType,
} from '@/db/mappers';
import type { SyncQueueItem } from '@/types/db.types';

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
 * Fetches leave requests for the authenticated worker.
 * Cache-first: reads from IndexedDB if TTL fresh (2 min).
 *
 * TODO (real API): fetch('/api/v1/leave-requests', { headers: { Authorization: `Bearer ${token}` } })
 */
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await leaveRequestRepository.isCacheFresh()) {
    const local = await leaveRequestRepository.getAllSorted();
    if (local.length > 0) {
      console.debug('[leaveService] Cache HIT — leave requests from DB');
      return local.map(fromLocalLeaveRequest);
    }
  }

  // ── Cache MISS ─────────────────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 500));
  const requests = [...MOCK_LEAVE_REQUESTS];

  await leaveRequestRepository.saveMany(requests.map(toLocalLeaveRequest));
  await leaveRequestRepository.markFetched();

  return requests;
}

/**
 * Derives calendar dots from IndexedDB leave requests for a given month.
 * Reads from DB directly — no extra API call needed.
 */
export async function fetchLeaveCalendar(yearMonth: string): Promise<CalendarDot[]> {
  const local = await leaveRequestRepository.getAllSorted();
  const requests = local.map(fromLocalLeaveRequest);

  return requests.flatMap(req => {
    const dots: CalendarDot[] = [];
    const start = new Date(req.startDate + 'T00:00:00');
    const end = new Date(req.endDate + 'T00:00:00');
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().split('T')[0];
      if (iso.startsWith(yearMonth)) {
        dots.push({ date: iso, status: req.status });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dots;
  });
}

/**
 * Fetches leave type catalog.
 * Cache-first (1 hour TTL) — near-static data.
 *
 * TODO (real API): fetch('/api/v1/leave-types', ...)
 */
export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  // ── Cache HIT ──────────────────────────────────────────────────────────────
  if (await leaveTypeRepository.isCacheFresh()) {
    const local = await leaveTypeRepository.getAll();
    if (local.length > 0) {
      console.debug('[leaveService] Cache HIT — leave types from DB');
      return local.map(fromLocalLeaveType);
    }
  }

  // ── Cache MISS ─────────────────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 200));
  const types = MOCK_LEAVE_TYPES;

  await leaveTypeRepository.saveMany(types.map(toLocalLeaveType));
  await leaveTypeRepository.markFetched();

  return types;
}

/**
 * Creates a new leave request.
 * Optimistic: saves to DB immediately with status='pending' + enqueues to SyncQueue.
 *
 * TODO (real API): SyncService.flush() will POST to /api/v1/leave-requests
 */
export async function createLeaveRequest(payload: {
  typeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequest> {
  await new Promise(r => setTimeout(r, 700));

  const type = MOCK_LEAVE_TYPES.find(t => t.id === payload.typeId);
  const start = new Date(payload.startDate + 'T00:00:00');
  const end = new Date(payload.endDate + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const newRequest: LeaveRequest = {
    id: `lr-${Date.now()}`,
    type: type?.label_uk ?? payload.typeId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    durationDays: days,
    reason: payload.reason,
    status: 'pending',
  };

  // ── Write to IndexedDB ─────────────────────────────────────────────────────
  await leaveRequestRepository.save(toLocalLeaveRequest(newRequest));
  // Invalidate cache so list refreshes
  await leaveRequestRepository.invalidateCache();

  // ── Enqueue to SyncQueue ───────────────────────────────────────────────────
  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'leaveRequest',
    action: 'create',
    payload: {
      id: newRequest.id,
      ...payload,
    },
  }));

  console.debug('[leaveService] Leave request created and enqueued:', newRequest.id);
  return newRequest;
}
