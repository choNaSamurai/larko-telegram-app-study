// src/services/tasksService.ts
// Data access layer — all task fetching goes through here.
// ADR-001-C: mock now, real API later (only this file changes).

import { MOCK_TASKS } from '@/services/MockData';
import type { Task } from '@/types/task.types';

const SIMULATED_DELAY_MS = 600;

/**
 * Fetches tasks assigned to the authenticated worker.
 * TODO: Replace mock with real API call:
 *   const res = await fetch('/api/v1/tasks?workerId=me', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   return res.json();
 */
export async function fetchWorkerTasks(): Promise<Task[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  return MOCK_TASKS;
}
