// W3 My Balance — TanStack Query hooks
// Tech Stack § Phase 2 — Data Layer

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { MOCK_BALANCE_SUMMARY, MOCK_TRANSACTIONS } from '../services/balanceMockData';
import type { BalanceSummary, BalanceHistoryPage } from '../types/balance';
import { useOrderStore } from '../store/useOrderStore';

/**
 * Returns current billing period as "YYYY-MM"
 * Per Tech Stack developer notes (Q2): calendar month from new Date()
 */
export function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Simulated fetch for summary
const fetchBalanceSummary = async (
  _workerId: string,
  _companyId: string,
  _period: string
): Promise<BalanceSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return MOCK_BALANCE_SUMMARY;
};

// Simulated fetch for history page
const fetchBalanceHistory = async (
  _companyId: string,
  _period: string,
  page: number
): Promise<BalanceHistoryPage> => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const pageSize = 20;
  const start = page * pageSize;
  const items = MOCK_TRANSACTIONS.slice(start, start + pageSize);
  return {
    items,
    total: MOCK_TRANSACTIONS.length,
  };
};

export const useBalanceSummary = (companyId: string, period: string) => {
  const workerId = 'worker-1'; // In production: from Telegram initData
  return useQuery<BalanceSummary>({
    queryKey: ['balance', 'summary', companyId, period],
    queryFn: () => fetchBalanceSummary(workerId, companyId, period),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!companyId,
  });
};

export const useBalanceHistory = (companyId: string, period: string) => {
  return useInfiniteQuery<BalanceHistoryPage>({
    queryKey: ['balance', 'history', companyId, period],
    queryFn: ({ pageParam = 0 }) =>
      fetchBalanceHistory(companyId, period, pageParam as number),
    getNextPageParam: (lastPage, pages) =>
      lastPage.items.length === 20 ? pages.length : undefined,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    enabled: !!companyId,
  });
};

// Custom hook that combines both queries and exposes from the store
export const useBalanceData = () => {
  const { currentCompany } = useOrderStore();
  const period = currentPeriod();
  const companyId = currentCompany?.id ?? '';

  const summaryQuery = useBalanceSummary(companyId, period);
  const historyQuery = useBalanceHistory(companyId, period);

  return { summaryQuery, historyQuery, period, companyId };
};
