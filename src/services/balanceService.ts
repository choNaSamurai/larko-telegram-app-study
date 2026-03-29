// src/services/balanceService.ts
// Traces to: Tech Stack §balanceService.ts, ADR-002-A (React Query), ADR-002-C (mock)
// CONSTRAINT: ALL balance data access goes through this module — never fetch() in components

import { MOCK_BALANCE_DEFAULT } from '@/services/MockData';
import type { BalanceData, BalancePeriod } from '@/types/balance.types';

const SIMULATED_DELAY_MS = 600;

/**
 * Fetches balance snapshot + history for the authenticated worker.
 *
 * TODO: Replace mock with real API:
 *   fetch(`/api/v1/worker/balance?period=${period}`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   })
 */
export async function fetchWorkerBalance(period: BalancePeriod): Promise<BalanceData> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY_MS));

  // Uncomment to test specific states:
  // return MOCK_BALANCE_NEGATIVE;
  // return MOCK_BALANCE_EMPTY;

  // Suppress unused-import warnings for the above constants
  void period;

  return MOCK_BALANCE_DEFAULT;
}
