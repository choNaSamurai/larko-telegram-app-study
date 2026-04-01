// src/api/timelogsApi.ts
// TimeLogs API — submit, list by order, list my timelogs
// Source: backend/api_endpoints_reference.md §7 TimeLogs
// Swagger operationIds:
//   submit_timelog_api_v1_timelogs_post
//   list_order_timelogs_api_v1_timelogs_orders__order_id__timelogs_get
//   my_timelogs_api_v1_timelogs_my_get

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export interface BreakCreate {
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
}

export interface TimeLogSubmit {
  order_id: string;
  work_date: string;        // YYYY-MM-DD
  start_time?: string | null; // HH:MM:SS
  end_time?: string | null;   // HH:MM:SS
  breaks?: BreakCreate[];    // max 5
  notes?: string | null;
  quantity_done?: number | null;
}

export interface TimeLogResponse {
  id: string;
  member_id: string;
  order_id: string;
  company_id: string;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  gross_hours: number;
  break_hours: number;
  net_hours: number;
  overtime_hours: number;
  status: string;
  notes: string | null;
  quantity_done: number | null;
  created_at: string;
}

export interface TimeLogListResponse {
  items: TimeLogResponse[];
  total: number;
  has_more: boolean;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Submit a timelog with breaks.
 * Idempotent: returns 409 on duplicate worker/order/date.
 * operationId: submit_timelog_api_v1_timelogs_post
 */
export async function submitTimelog(dto: TimeLogSubmit): Promise<TimeLogResponse> {
  return httpClient.post<TimeLogResponse>('/timelogs', dto);
}

/**
 * List timelogs for a specific order.
 * operationId: list_order_timelogs_api_v1_timelogs_orders__order_id__timelogs_get
 */
export async function getOrderTimelogs(
  orderId: string,
  limit = 50,
  offset = 0,
): Promise<TimeLogListResponse> {
  return httpClient.get<TimeLogListResponse>(
    `/timelogs/orders/${orderId}/timelogs?limit=${limit}&offset=${offset}`,
  );
}

/**
 * List the current worker's timelogs.
 * operationId: my_timelogs_api_v1_timelogs_my_get
 */
export async function getMyTimelogs(
  companyId: string,
  limit = 50,
  offset = 0,
): Promise<TimeLogListResponse> {
  return httpClient.get<TimeLogListResponse>(
    `/timelogs/my?company_id=${companyId}&limit=${limit}&offset=${offset}`,
  );
}
