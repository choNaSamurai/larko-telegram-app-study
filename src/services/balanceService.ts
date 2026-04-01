// src/services/balanceService.ts
// Data access layer — real API: worker balance + history.
// Source: backend/api_endpoints_reference.md §Finance
//
// REAL API:
//   GET /finance/companies/{company_id}/balance/{member_id}
//   GET /finance/companies/{company_id}/balance/{member_id}/history

import type { BalanceData, BalancePeriod, BalanceHistoryItem, HistoryItemType } from '@/types/balance.types';
import { getWorkerBalance, getBalanceHistory } from '@/api/financeApi';
import type { BalanceTransactionEntry } from '@/api/financeApi';
import { getAuthState } from '@/stores/authStore';

// ─── Mappers ──────────────────────────────────────────────────────────────────

/** Map API transaction_type → UI HistoryItemType */
function mapTransactionType(apiType: string): HistoryItemType {
  if (apiType.includes('overtime')) return 'overtime';
  if (apiType.includes('advance')) return 'advance';
  return 'earned';  // timelog_earn, bonus, adjustment → earned
}

/** Format ISO date → Ukrainian short date string "23 бер" */
function formatUkDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  } catch {
    return isoDate.slice(0, 10);
  }
}

/** Derive current period label from BalancePeriod */
function periodLabel(period: BalancePeriod): string {
  const now = new Date();
  if (period === 'week') return 'Поточний тиждень';
  if (period === 'all') return 'Весь час';
  // 'month' → e.g. "Квітень 2026"
  return now.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
}

function mapTransaction(t: BalanceTransactionEntry): BalanceHistoryItem {
  const type = mapTransactionType(t.transaction_type);
  return {
    id: `tx-${t.date}-${Math.random().toString(36).slice(2)}`,
    type,
    name: t.order_title ?? t.description ?? (type === 'advance' ? 'Аванс' : 'Нарахування'),
    date: formatUkDate(t.date),
    hours: type !== 'advance'
      ? undefined   // hours appear in description — not separately in API
      : undefined,
    amount: type === 'advance' ? -Math.abs(t.amount) : Math.abs(t.amount),
    currency: '₴',
  };
}

/**
 * Fetches balance snapshot + history for the authenticated worker.
 *
 * REAL API:
 *   GET /finance/companies/{company_id}/balance/{member_id}
 *   GET /finance/companies/{company_id}/balance/{member_id}/history
 */
export async function fetchWorkerBalance(period: BalancePeriod): Promise<BalanceData> {
  const { companyId, memberId } = getAuthState();

  if (!companyId || !memberId) {
    console.warn('[balanceService] Missing companyId or memberId — returning empty balance');
    return {
      earned: 0,
      advances: 0,
      remaining: 0,
      periodLabel: periodLabel(period),
      history: [],
    };
  }

  const [balanceResp, historyResp] = await Promise.all([
    getWorkerBalance(companyId, memberId),
    getBalanceHistory(companyId, memberId),
  ]);

  const history: BalanceHistoryItem[] = (historyResp.transactions ?? []).map(mapTransaction);

  return {
    earned: balanceResp.total_earned ?? 0,
    advances: balanceResp.total_advances ?? 0,
    remaining: balanceResp.balance ?? 0,
    periodLabel: periodLabel(period),
    history,
  };
}
