// src/services/timeLogService.ts
// Data access layer — saves time logs to IndexedDB + SyncQueue.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §7 Sync Strategy

import type { TimeLogEntry, TimeLogFormState } from '@/types/timeLog.types';
import { timeLogRepository, syncQueueRepository } from '@/db/repositories';
import { fromLocalTimeLogToTimeLogEntry } from '@/db/mappers';
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
 * Fetch all time log entries for a given order, optionally filtered by date.
 * Reads from IndexedDB — time logs are written to DB when created.
 *
 * TODO (real API): Used for cold-start sync; once seeded from server,
 * the DB is the source of truth for the session.
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
 * Writes to IndexedDB immediately (optimistic) + enqueues to SyncQueue.
 * Source: DAD §6 — Action: Worker submits time log
 *
 * Throws 409-like error if a log for this date already exists (BR-TL-001).
 *
 * TODO (real API): SyncService.flush() will POST to:
 *   /api/v1/orders/{orderId}/time-logs
 */
export async function saveTimeLog(
  orderId: string,
  form: TimeLogFormState,
  netHours: number
): Promise<TimeLogEntry> {
  // ── BR-TL-001: duplicate date guard ────────────────────────────────────────
  const duplicate = await timeLogRepository.existsForDate(orderId, form.logDate);
  if (duplicate) {
    throw Object.assign(
      new Error('Для цього дня вже існує запис часу.'),
      { status: 409 }
    );
  }

  const id = `tl-${Date.now()}`;
  const now = Date.now();

  const localEntry = {
    id,
    orderId,
    workerId: 'worker-001',
    logDate: form.logDate,
    workStart: form.workStart,
    workEnd: form.workEnd,
    breaks: form.breaks,
    netHours,
    comment: form.comment || undefined,
    unitsCompleted: form.unitsCompleted,
    isOvertime: false,
    overtimeHours: undefined,
    isReadOnly: false,
    updatedAt: now,
    createdAt: now,
    isSynced: false,
    _localVersion: 1,
  };

  // ── Write to IndexedDB ─────────────────────────────────────────────────────
  await timeLogRepository.save(localEntry);

  // ── Enqueue to SyncQueue ───────────────────────────────────────────────────
  await syncQueueRepository.enqueue(makeSyncItem({
    entityType: 'timeLogEntry',
    action: 'create',
    payload: {
      orderId,
      id,
      logDate: form.logDate,
      workStart: form.workStart,
      workEnd: form.workEnd,
      breaks: form.breaks,
      netHours,
      comment: form.comment,
      unitsCompleted: form.unitsCompleted,
    },
  }));

  console.debug('[timeLogService] Time log saved to DB + enqueued:', id);

  return fromLocalTimeLogToTimeLogEntry(localEntry);
}
