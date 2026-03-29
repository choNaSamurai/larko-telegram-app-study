// src/types/balance.types.ts
// Traces to: Tech Stack §TypeScript Interfaces, Scenario §10 BalanceHistoryItem

export type BalancePeriod = 'week' | 'month' | 'all';

export type HistoryItemType = 'earned' | 'advance' | 'overtime';

export interface BalanceHistoryItem {
  id: string;
  type: HistoryItemType;
  name: string;     // Order name or "Аванс"
  date: string;     // "23 бер"
  hours?: string;   // "9.0 год" — only for earned/overtime; absent for advances
  amount: number;   // Signed: positive for earned/overtime, negative for advance
  currency: string; // "₴"
}

export interface BalanceData {
  earned: number;       // Total earned in period (always >= 0)
  advances: number;     // Total advances issued (always >= 0)
  remaining: number;    // earned - advances (may be negative, BR-W3-03)
  periodLabel: string;  // "Березень 2026" | "Поточний тиждень" | "Весь час"
  history: BalanceHistoryItem[];
}

// Screen state machine — Scenario §8
export type BalanceScreenState =
  | 'loading'
  | 'populated'
  | 'negative'   // Remaining < 0 (still shows history, but also banner)
  | 'empty'      // history.length === 0
  | 'error';
