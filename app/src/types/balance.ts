// W3 My Balance — Domain Types
// Source: Tech Stack § TypeScript Interfaces + Scenario § UI Elements

export type TransactionType = 'earning' | 'advance' | 'overtime' | 'adjustment';

export type BalanceScreenState =
  | 'loading'
  | 'error'
  | 'empty'
  | 'populated_positive'
  | 'populated_negative';

export interface BalanceSummary {
  earned: number;
  advances: number;
  remaining: number;
  currency: string; // e.g. "UAH"
}

export interface TransactionItem {
  id: string;
  date: string;          // ISO 8601
  type: TransactionType;
  orderName?: string;    // present for 'earning' | 'overtime'
  hours?: number;        // worked hours (earning / overtime)
  multiplier?: number;   // overtime only, e.g. 1.5
  amount: number;        // always positive magnitude; sign derived from type
}

export interface BalanceHistoryPage {
  items: TransactionItem[];
  total: number;
}

// GET /balance/summary
export interface GetBalanceSummaryRequest {
  workerId: string;
  companyId: string;
  period: string; // "YYYY-MM"
}

// GET /balance/history
export interface GetBalanceHistoryRequest {
  workerId: string;
  companyId: string;
  period: string;
  page?: number;
  limit?: number; // default: 20
}
