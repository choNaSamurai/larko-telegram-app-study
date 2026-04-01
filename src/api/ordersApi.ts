// src/api/ordersApi.ts
// Orders API — my orders, order detail, worker signals
// Source: backend/api_endpoints_reference.md §6 Orders
// Swagger operationIds:
//   my_orders_api_v1_orders_orders_my_get
//   get_order_api_v1_orders_orders__order_id__get
//   signal_worker_start_api_v1_orders_orders__order_id__worker_start_post
//   signal_worker_done_api_v1_orders_orders__order_id__worker_done_post

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export interface OrderAssignmentDetail {
  member_id: string;
  full_name: string;
  is_lead: boolean;
  status: string;
  worker_done: boolean;
  payout_percentage: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderResponse {
  id: string;
  company_id: string;
  product_type_id: string;
  client_id: string | null;
  client_name: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  status: 'new' | 'in_progress' | 'blocked' | 'in_review' | 'dispute' | 'done';
  assignments: OrderAssignmentDetail[];
  order_number: string | null;
  order_date: string;
  work_start_date: string | null;
  due_date: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lead_worker_id: string | null;
  pay_model_snapshot: string;
  unit_rate_snapshot: number;
  unit_snapshot: string;
  pricing_schema_snapshot: Record<string, unknown> | null;
  quantity: number | null;
  address: string | null;
  created_by: string;
  created_at: string;
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
  has_more: boolean;
}

export interface AssignmentResponse {
  id: string;
  order_id: string;
  member_id: string;
  assigned_by: string;
  status: string;
  is_lead: boolean;
  worker_done: boolean;
  created_at: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * List orders assigned to the current worker.
 * operationId: my_orders_api_v1_orders_orders_my_get
 */
export async function getMyOrders(
  companyId: string,
  limit = 100,
  offset = 0,
): Promise<OrderListResponse> {
  return httpClient.get<OrderListResponse>(
    `/orders/orders/my?company_id=${companyId}&limit=${limit}&offset=${offset}`,
  );
}

/**
 * Get full order details.
 * operationId: get_order_api_v1_orders_orders__order_id__get
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return httpClient.get<OrderResponse>(`/orders/orders/${orderId}`);
}

/**
 * Worker signals they started working on the order.
 * Transitions order new → in_progress.
 * operationId: signal_worker_start_api_v1_orders_orders__order_id__worker_start_post
 */
export async function signalWorkerStart(orderId: string): Promise<AssignmentResponse> {
  return httpClient.post<AssignmentResponse>(`/orders/orders/${orderId}/worker-start`);
}

/**
 * Worker signals their part of the order is complete.
 * operationId: signal_worker_done_api_v1_orders_orders__order_id__worker_done_post
 */
export async function signalWorkerDone(orderId: string, notes?: string): Promise<AssignmentResponse> {
  return httpClient.post<AssignmentResponse>(`/orders/orders/${orderId}/worker-done`, {
    notes: notes ?? null,
  });
}
