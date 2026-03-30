// src/services/timeLogService.ts
// Traces to: Tech Stack §timeLogService.ts, Scenario §10 API Contracts
// Data access layer — mock implementation, replace with real API calls

import {
  MOCK_TIME_LOGS_EMPTY,
  // MOCK_TIME_LOGS_POPULATED,  // ← uncomment to test populated state
} from '@/services/MockData';
import type { TimeLogEntry, TimeLogFormState } from '@/types/timeLog.types';

const SIMULATED_DELAY_MS = 500;

/**
 * Fetch all time log entries for a given order + date.
 * TODO: Replace mock with:
 *   fetch(`/api/v1/orders/${orderId}/time-logs?date=${date}`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   })
 */
export async function fetchTimeLogsByDate(
  orderId: string,
  date: string
): Promise<TimeLogEntry[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));
  // Toggle to MOCK_TIME_LOGS_POPULATED to test populated state:
  return MOCK_TIME_LOGS_EMPTY.filter((e) => e.orderId === orderId && e.logDate === date);
}

/**
 * Save a new time log entry.
 * TODO: Replace mock with:
 *   fetch(`/api/v1/orders/${orderId}/time-logs`, {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
 *     body: JSON.stringify(form)
 *   })
 * Throws on validation/409 conflict.
 */
export async function saveTimeLog(
  orderId: string,
  form: TimeLogFormState,
  netHours: number
): Promise<TimeLogEntry> {
  await new Promise((r) => setTimeout(r, 800));

  // Simulate 409 Conflict for duplicate date scenario:
  // throw Object.assign(new Error('Conflict'), { status: 409 });

  const entry: TimeLogEntry = {
    id: `tl-${Date.now()}`,
    orderId,
    workerId: 'worker-001',
    logDate: form.logDate,
    workStart: form.workStart,
    workEnd: form.workEnd,
    breaks: form.breaks,
    netHours,
    comment: form.comment || undefined,
    unitsCompleted: form.unitsCompleted,
    syncStatus: 'synced',
  };
  return entry;
}
