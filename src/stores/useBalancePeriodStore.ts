// src/stores/useBalancePeriodStore.ts
// Traces to: Tech Stack §useBalancePeriodStore.ts, ADR-002-B
// CONSTRAINT: Period state persists across Bottom Nav tab switches (same rationale as ADR-001-B)

import { create } from 'zustand';
import type { BalancePeriod } from '@/types/balance.types';

interface BalancePeriodState {
  activePeriod: BalancePeriod;
  setPeriod: (period: BalancePeriod) => void;
}

export const useBalancePeriodStore = create<BalancePeriodState>((set) => ({
  activePeriod: 'month',           // Default: current calendar month (matches Figma design)
  setPeriod: (period) => set({ activePeriod: period }),
}));
