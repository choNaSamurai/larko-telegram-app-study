// W3 My Balance — Mock data for development
// Mirrors the API shape from Scenario § Integrations & API Contracts

import type { BalanceSummary, TransactionItem } from '../types/balance';

export const MOCK_BALANCE_SUMMARY: BalanceSummary = {
  earned: 18450,
  advances: 5000,
  remaining: 13450,
  currency: 'UAH',
};

export const MOCK_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    date: '2026-03-23',
    type: 'earning',
    orderName: 'Сонячна Станція №4',
    hours: 9.0,
    amount: 4050,
  },
  {
    id: 'tx-2',
    date: '2026-03-22',
    type: 'advance',
    amount: 5000,
  },
  {
    id: 'tx-3',
    date: '2026-03-21',
    type: 'earning',
    orderName: 'Ремонт електропроводки',
    hours: 8.0,
    amount: 3200,
  },
  {
    id: 'tx-4',
    date: '2026-03-20',
    type: 'overtime',
    orderName: 'Станція №4',
    hours: 2.5,
    multiplier: 1.5,
    amount: 1688,
  },
  {
    id: 'tx-5',
    date: '2026-03-19',
    type: 'earning',
    orderName: 'Аудит лічильників',
    hours: 8.0,
    amount: 3600,
  },
  {
    id: 'tx-6',
    date: '2026-03-18',
    type: 'earning',
    orderName: 'Підключення лічильника',
    hours: 6.0,
    amount: 2100,
  },
  {
    id: 'tx-7',
    date: '2026-03-16',
    type: 'adjustment',
    amount: 812,
    orderName: 'Коригування',
  },
];

// Negative balance scenario for testing
export const MOCK_BALANCE_NEGATIVE: BalanceSummary = {
  earned: 3200,
  advances: 8000,
  remaining: -4800,
  currency: 'UAH',
};
