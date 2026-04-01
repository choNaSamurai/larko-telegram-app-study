// src/services/timeLogService.ts
// Data access layer — saves time logs to IndexedDB + submits to real API.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §7 Sync Strategy
//
// INTEGRATION: submitTimelog() calls POST /timelogs directly and then persists to DB.
// On 409 from API (duplicate) → surface "Дублікат запису" to UI (BR-TL-001).

import type { TimeLogEntry, TimeLogFormState } from '@/types/timeLog.types';
import { timeLogRepository } from '@/db/repositories';
import { fromLocalTimeLogToTimeLogEntry } from '@/db/mappers';
import { submitTimelog, getOrderTimelogs } from '@/api/timelogsApi';
import type { BreakCreate } from '@/api/timelogsApi';
import { ApiError } from '@/api/apiError';

/**
 * Fetch all time log entries for a given order, filtered by date.
 * Reads from IndexedDB — populated during order fetch.
 *
 * API sync happens in orderService.fetchOrderById (seeds DB from /timelogs/{id}).
 */
export async function fetchTimeLogsByDate(
  orderId: string,
  date: string
): Promise<TimeLogEntry[]> {
  const all = await timeLogRepository.getByOrderId(orderId);
  const filtered = all.filter(e => e.logDate === date);
  return filtered.map(fromLocalTimeLogToTimeLogEntry);
}

/**
 * Save a new time log entry.
 *
 * Flow:
 *   1. Duplicate guard: check DB for existing log on this date (BR-TL-001)
 *   2. POST /timelogs → real API
 *   3. On success: write to IndexedDB with isSynced=true
 *   4. On API 409: rethrow as localized error
 *
 * REAL API: POST /timelogs
 */
export async function saveTimeLog(
  orderId: string,
  form: TimeLogFormState,
  netHours: number
): Promise<TimeLogEntry> {
  // ── BR-TL-001: duplicate date guard (client-side fast check) ───────────────
  const duplicate = await timeLogRepository.existsForDate(orderId, form.logDate);
  if (duplicate) {
    throw Object.assign(
      new Error('Для цього дня вже існує запис часу.'),
      { status: 409 }
    );
  }

  // ── Map form breaks to API format ─────────────────────────────────────────
  const apiBreaks: BreakCreate[] = (form.breaks ?? []).map((b) => ({
    start_time: b.breakStart.length === 5 ? `${b.breakStart}:00` : b.breakStart,
    end_time: b.breakEnd.length === 5 ? `${b.breakEnd}:00` : b.breakEnd,
  }));

  // ── POST to real API ──────────────────────────────────────────────────────
  let apiResponse;
  try {
    apiResponse = await submitTimelog({
      order_id: orderId,
      work_date: form.logDate,
      start_time: form.workStart ? `${form.workStart}:00` : null,
      end_time: form.workEnd ? `${form.workEnd}:00` : null,
      breaks: apiBreaks.length > 0 ? apiBreaks : undefined,
      notes: form.comment || null,
      quantity_done: form.unitsCompleted ?? null,
    });
  } catch (err) {
    if (err instanceof ApiError && err.isConflict) {
      // API 409 → duplicate time log (BR-TL-001)
      throw Object.assign(
        new Error('Для цього дня вже існує запис часу. (API 409)'),
        { status: 409 }
      );
    }
    throw err;
  }

  // ── Persist to IndexedDB with isSynced=true (already sent to API) ─────────
  const now = Date.now();
  const localEntry = {
    id: apiResponse.id,
    orderId: apiResponse.order_id,
    workerId: apiResponse.member_id,
    logDate: apiResponse.work_date,
    workStart: form.workStart,
    workEnd: form.workEnd,
    breaks: form.breaks,
    netHours,
    comment: form.comment || undefined,
    unitsCompleted: form.unitsCompleted,
    isOvertime: apiResponse.overtime_hours > 0,
    overtimeHours: apiResponse.overtime_hours || undefined,
    isReadOnly: false,
    updatedAt: now,
    createdAt: now,
    isSynced: true,
    _localVersion: 1,
  };

  await timeLogRepository.save(localEntry);

  console.debug('[timeLogService] Time log submitted to API + saved to DB:', apiResponse.id);

  return fromLocalTimeLogToTimeLogEntry(localEntry);
}

/**
 * Re-fetch timelogs for an order from the API (invalidate local cache).
 * Called after a timelog is added to refresh the Order Hub list.
 */
export async function refreshOrderTimelogs(orderId: string): Promise<void> {
  const resp = await getOrderTimelogs(orderId);
  const now = Date.now();

  await timeLogRepository.saveMany(
    resp.items.map((tl) => ({
      id: tl.id,
      orderId: tl.order_id,
      workerId: tl.member_id,
      logDate: tl.work_date,
      workStart: tl.start_time?.slice(0, 5) ?? '00:00',
      workEnd: tl.end_time?.slice(0, 5) ?? '00:00',
      breaks: [],
      netHours: tl.net_hours,
      comment: tl.notes ?? undefined,
      unitsCompleted: tl.quantity_done ?? undefined,
      isOvertime: tl.overtime_hours > 0,
      overtimeHours: tl.overtime_hours || undefined,
      isReadOnly: true,
      updatedAt: now,
      createdAt: now,
      isSynced: true,
      _localVersion: 1,
    }))
  );
}
