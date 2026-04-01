// src/api/financeApi.ts
// Finance API — worker balance + balance history
// Source: backend/api_endpoints_reference.md §9 Finance
// Swagger operationIds:
//   get_worker_balance_api_v1_finance_companies__company_id__balance__member_id__get
//   get_balance_history_api_v1_finance_companies__company_id__balance__member_id__history_get

import { httpClient } from './httpClient';

// ─── Swagger schema types ─────────────────────────────────────────────────────

export interface WorkerBalanceResponse {
  member_id: string;
  total_earned: number;
  total_advances: number;
  balance: number;  // net: earned - advances (+ adjustments)
  currency: string; // 'UAH'
}

export interface BalanceTransactionEntry {
  date: string;            // ISO datetime
  transaction_type: string; // e.g. 'timelog_earn', 'advance', 'bonus', 'penalty', 'deduction', 'refund'
  amount: number;           // positive = credit, negative = debit
  description: string;
  order_title: string | null;
}

export interface BalanceHistoryResponse {
  member_id: string;
  transactions: BalanceTransactionEntry[];
  total: number;
  currency: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Get worker's current balance summary.
 * Worker role: self-access only (RBAC guard on backend).
 * operationId: get_worker_balance_api_v1_finance_companies__company_id__balance__member_id__get
 */
export async function getWorkerBalance(
  companyId: string,
  memberId: string,
): Promise<WorkerBalanceResponse> {
  return httpClient.get<WorkerBalanceResponse>(
    `/finance/companies/${companyId}/balance/${memberId}`,
  );
}

/**
 * Get worker's balance transaction history.
 * operationId: get_balance_history_api_v1_finance_companies__company_id__balance__member_id__history_get
 */
export async function getBalanceHistory(
  companyId: string,
  memberId: string,
): Promise<BalanceHistoryResponse> {
  return httpClient.get<BalanceHistoryResponse>(
    `/finance/companies/${companyId}/balance/${memberId}/history`,
  );
}
