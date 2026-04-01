// src/services/tasksService.ts
// Data access layer — cache-first via IndexedDB (Dexie).
// Pattern: check cache → return DB data / fetch API → save to DB → return.
// Source: DAD_Global_Data_Layer.md §6 Data Flow, §8 Caching Strategy

import type { Task, TaskStatus } from '@/types/task.types';
import { taskRepository } from '@/db/repositories';
import { toLocalTask, fromLocalTask } from '@/db/mappers';
import { getMyOrders } from '@/api/ordersApi';
import type { OrderResponse } from '@/api/ordersApi';
import { getAuthState } from '@/stores/authStore';

// ─── Status mapping ───────────────────────────────────────────────────────────
// API statuses: new | in_progress | blocked | in_review | dispute | done
// UI statuses:  new | in_progress | overdue | checking | dispute | done
// Q2 confirmed: 'overdue' is derived client-side from due_date < today

function deriveTaskStatus(order: OrderResponse): TaskStatus {
  const apiStatus = order.status;
  if (apiStatus === 'in_review') return 'checking';
  if (apiStatus === 'blocked') return 'in_progress'; // treat blocked as still in progress
  if ((apiStatus === 'new' || apiStatus === 'in_progress') && order.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(order.due_date);
    if (due < today) return 'overdue';
  }
  return apiStatus as TaskStatus;
}

/** Map OrderResponse → Task frontend shape */
function mapOrderToTask(order: OrderResponse): Task {
  const status = deriveTaskStatus(order);
  const isNew = status === 'new';
  const isActive = status === 'in_progress' || status === 'overdue';

  const payModel = order.pay_model_snapshot; // 'fixed' | 'per_unit' | 'per_hour'

  return {
    id: order.id,
    name: order.title,
    status,
    companyName: order.client_name ?? '',
    address: order.address ?? '',
    notes: order.notes ?? undefined,
    deadline: order.due_date ?? order.order_date,
    paymentModel: (payModel as Task['paymentModel']) ?? 'fixed',
    amount: order.unit_rate_snapshot ?? 0,
    amountPerUnit: payModel === 'per_unit' ? order.unit_rate_snapshot : undefined,
    unitLabel: payModel === 'per_unit' ? (order.unit_snapshot ?? 'шт') : undefined,
    quantity: order.quantity ?? undefined,
    assignees: (order.assignments ?? []).map((a) => ({
      id: a.member_id,
      initials: (a.full_name ?? '?').charAt(0).toUpperCase(),
      color: '#34d399', // default color — individualization is a Phase 2 feature
    })),
    hasStartButton: isNew,
    hasActionButtons: isActive,
  };
}

/**
 * Fetches tasks (orders) assigned to the authenticated worker.
 * Cache-first: reads from IndexedDB if TTL is fresh.
 * Cold start: fetches from API, saves to DB, marks cache.
 *
 * REAL API: GET /orders/orders/my?company_id={company_id}
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

  // ── Cache MISS — fetch from real API ──────────────────────────────────────
  const { companyId } = getAuthState();

  if (!companyId) {
    console.warn('[tasksService] No companyId — cannot fetch tasks');
    return [];
  }

  console.debug('[tasksService] Cache MISS — fetching from API, companyId:', companyId);
  const response = await getMyOrders(companyId);
  const tasks: Task[] = response.items.map(mapOrderToTask);

  // Save to IndexedDB
  await taskRepository.saveMany(tasks.map(toLocalTask));
  await taskRepository.markFetched();

  return tasks;
}
