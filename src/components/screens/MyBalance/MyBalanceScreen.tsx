// src/components/screens/MyBalance/MyBalanceScreen.tsx
// Traces to: Scenario §4 Main Flow, §8 Screen States, ADR-002-A/B/D
// Figma root node: 73:52914 (W3 Default Dark)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';


import { useBalancePeriodStore } from '@/stores/useBalancePeriodStore';
import { fetchWorkerBalance } from '@/services/balanceService';
import { formatPeriodLabel } from '@/utils/formatters';
import type { BalanceData, BalanceScreenState } from '@/types/balance.types';

import { BottomNav } from '@/components/BottomNav';
import { StatCards } from './StatCards';
import { PeriodFilter } from './PeriodFilter';
import { NegativeBanner } from './NegativeBanner';
import { HistoryList } from './HistoryList';
import { InfoPopup } from './InfoPopup';
import { BalanceSkeleton } from './BalanceSkeleton';
import { BalanceEmpty } from './BalanceEmpty';
import { BalanceError } from './BalanceError';

/**
 * Pure state machine — maps React Query state + data to typed BalanceScreenState.
 * CONSTRAINT: NEVER inline this logic in JSX (same pattern as MyTasksScreen).
 */
function deriveScreenState(
  isLoading: boolean,
  isError: boolean,
  data: BalanceData | undefined,
): BalanceScreenState {
  if (isLoading) return 'loading';
  if (isError)   return 'error';
  if (!data || data.history.length === 0) return 'empty';
  if (data.remaining < 0) return 'negative';
  return 'populated';
}

interface MyBalanceScreenProps {
  onGoToTasks: () => void; // BR-W3-10: empty state CTA navigates to W1
}

export function MyBalanceScreen({ onGoToTasks }: MyBalanceScreenProps) {
  const { activePeriod } = useBalancePeriodStore();
  const [showInfo, setShowInfo] = useState(false);

  // ADR-002-A: queryKey includes period — auto-refetch on period change
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['balance', activePeriod],
    queryFn: () => fetchWorkerBalance(activePeriod),
    staleTime: 5 * 60 * 1000, // 5 min — balance changes rarely
    retry: 2,
  });

  const screenState = deriveScreenState(isLoading, isError, data);
  const isNegative  = screenState === 'negative';
  const deficit     = isNegative && data ? Math.abs(data.remaining) : 0;

  return (
    // Safe area: env(safe-area-inset-top) — SKILL constraint, Scenario §12.1
    <div
      className="flex flex-col h-full bg-bg-screen"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* ── HEADER — always visible ─────────────────────────────────────────── */}
      {/* Figma: h-[68px], px-4, title 18px SemiBold, subtitle 12px Regular */}
      <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 68 }}>
        <div className="flex flex-col">
          {/* Screen title: 18px SemiBold -0.5px tracking — Scenario §12.1 */}
          <p
            className="text-[18px] font-semibold leading-7 text-text-primary"
            style={{ letterSpacing: '-0.5px' }}
          >
            Мій баланс
          </p>
          {/* Period subtitle: 12px Regular #9d9d9d — Scenario §12.1 */}
          <p className="text-[12px] font-normal leading-4 text-text-secondary">
            {data
              ? formatPeriodLabel(activePeriod, data.periodLabel)
              : formatPeriodLabel(activePeriod)}
          </p>
        </div>

        {/* ⓘ Info button: 32px white circle — Scenario §7, §12.1 */}
        <button
          onClick={() => setShowInfo(true)}
          className="rounded-full bg-white flex items-center justify-center transition-opacity active:opacity-70"
          style={{
            width: 32,
            height: 32,
            boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
          }}
          aria-label="Інформація про баланс"
        >
          <Icon icon="solar:info-circle-bold" width={16} height={16} color="#111827" />
        </button>
      </div>

      {/* ── LOADING STATE (S1) ──────────────────────────────────────────────── */}
      {screenState === 'loading' && (
        <div className="flex-1 overflow-auto hide-scrollbar pt-4">
          <BalanceSkeleton />
        </div>
      )}

      {/* ── ERROR STATE (S6) ────────────────────────────────────────────────── */}
      {screenState === 'error' && (
        <BalanceError onRetry={() => void refetch()} />
      )}

      {/* ── POPULATED / NEGATIVE / EMPTY (after data loads) ────────────────── */}
      {(screenState === 'populated' || screenState === 'negative' || screenState === 'empty') && data && (
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 hide-scrollbar pb-4">

          {/* Stat Cards row (always shown, even in empty — shows ₴0) */}
          {/* pt-0: header already has 68px, gap-4 handles vertical spacing */}
          <StatCards data={data} />

          {/* Period filter tabs (OQ-W3-01: confirmed to include) */}
          <PeriodFilter />

          {/* Negative balance warning banner — S3 only (BR-W3-04) */}
          {isNegative && <NegativeBanner deficit={deficit} />}

          {/* History vs Empty state */}
          {screenState === 'empty' ? (
            // S4: Empty state (BR-W3-10: CTA goes to W1)
            <BalanceEmpty onGoToTasks={onGoToTasks} />
          ) : (
            // S2 / S3: Scrollable history list (OQ-W3-04: fully scrollable)
            <HistoryList items={data.history} />
          )}
        </div>
      )}

      {/* ── INFO POPUP (S5) — portal, rendered on top of all content ───────── */}
      {/* ADR-002-D: createPortal so it layers over stat cards correctly */}
      {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

      {/* ── BOTTOM NAVIGATION — always visible, balance tab active ──────────── */}
      <BottomNav
        activeTab="balance"
        onTabChange={(tab) => {
          if (tab === 'tasks') onGoToTasks();
          // Profile tab: onGoToProfile (to be added when W4 is built)
        }}
      />
    </div>
  );
}
