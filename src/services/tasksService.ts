// src/services/tasksService.ts
// Data access layer — cache-first via IndexedDB (Dexie).
// Pattern: check cache → return DB data / fetch API → save to DB → return.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §8 Caching Strategy

import { MOCK_TASKS } from '@/services/MockData';
import type { Task } from '@/types/task.types';
import { taskRepository } from '@/db/repositories';
import { toLocalTask, fromLocalTask } from '@/db/mappers';

/**
 * Fetches tasks assigned to the authenticated worker.
 * Cache-first: reads from IndexedDB if TTL is fresh.
 * Cold start: fetches from API (mock), saves to DB, marks cache.
 *
 * TODO (real API): Replace mock fetch with:
 *   const res = await fetch('/api/v1/tasks?workerId=me', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   return res.json() as Task[];
 */
export async function fetchWorkerTasks(): Promise<Task[]> {
  // ── Cache HIT ──────────────────────────────────────────────────────────────
  const cacheIsFresh = await taskRepository.isCacheFresh();
  if (cacheIsFresh) {
    const localTasks = await taskRepository.getAll();
    if (localTasks.length > 0) {
      console.debug('[tasksService] Cache HIT — returning', localTasks.length, 'tasks from DB');
      return localTasks.map(fromLocalTask);
    }
  }

  // ── Cache MISS — fetch from API (mock) ────────────────────────────────────
  console.debug('[tasksService] Cache MISS — fetching from API');
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const tasks: Task[] = MOCK_TASKS;

  // Save to IndexedDB
  await taskRepository.saveMany(tasks.map(toLocalTask));
  await taskRepository.markFetched();

  return tasks;
}
