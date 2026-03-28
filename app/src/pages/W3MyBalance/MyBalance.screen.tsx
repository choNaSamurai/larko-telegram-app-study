// W3MyBalance.screen.tsx — Screen root; orchestrates queries + store
// Tech Stack § Phase 5 — Screen State Machine
// ADR-W3-01: TanStack Query v5 + Zustand

import { useBalanceData } from '../../hooks/useBalance';
import { useBalanceStore } from '../../store/useBalanceStore';
import { BalanceHeader } from './components/BalanceHeader';
import { StatCards } from './components/StatCards/StatCards';
import { WarningBanner } from './components/WarningBanner';
import { InfoPopup } from './components/InfoPopup';
import { TransactionHistory } from './components/TransactionHistory/TransactionHistory';
import { BalanceSkeleton } from './components/BalanceSkeleton';
import { BalanceEmptyState } from './components/BalanceEmptyState';
import { BalanceError } from './components/BalanceError';
import type { BalanceScreenState } from '../../types/balance';

/**
 * Derives the current screen state from both TanStack Query results.
 * Tech Stack § Phase 5 — deriveScreenState
 */
function deriveScreenState(
  summaryLoading: boolean,
  summaryError: boolean,
  historyLoading: boolean,
  historyError: boolean,
  earned: number | undefined,
  historyFirstPageEmpty: boolean
): BalanceScreenState {
  if (summaryLoading || historyLoading) return 'loading';
  if (summaryError || historyError) return 'error';
  if (earned === undefined) return 'error';
  if (earned === 0 && historyFirstPageEmpty) return 'empty';
  // remaining is derived from summary data — checked at render level
  return 'populated_positive'; // will be adjusted at render by checking remaining
}

interface W3MyBalanceScreenProps {
  onNavigateToTasks?: () => void;
}

export function W3MyBalanceScreen({ onNavigateToTasks }: W3MyBalanceScreenProps) {
  const { summaryQuery, historyQuery, period } = useBalanceData();
  const { isInfoPopupOpen, openInfoPopup, closeInfoPopup } = useBalanceStore();

  const summary = summaryQuery.data;
  const historyPages = historyQuery.data?.pages ?? [];
  const allHistoryItems = historyPages.flatMap((p) => p.items);
  const firstPageEmpty = historyPages[0]?.items.length === 0;

  const baseState = deriveScreenState(
    summaryQuery.isLoading,
    summaryQuery.isError,
    historyQuery.isLoading,
    historyQuery.isError,
    summary?.earned,
    firstPageEmpty
  );

  // Resolve full screen state including negative balance
  const screenState: BalanceScreenState =
    baseState === 'populated_positive' && summary && summary.remaining < 0
      ? 'populated_negative'
      : baseState;

  const handleRetry = () => {
    summaryQuery.refetch();
    historyQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-24 pt-[84px] relative">
      {/* Fixed Header */}
      <BalanceHeader period={period} onInfoClick={openInfoPopup} />

      {/* Info Popup Overlay — positioned relative to screen root */}
      {isInfoPopupOpen && <InfoPopup onClose={closeInfoPopup} />}

      {/* Screen content based on state machine */}
      <main className="flex flex-col gap-4">
        {screenState === 'loading' && (
          <BalanceSkeleton />
        )}

        {screenState === 'error' && (
          <BalanceError onRetry={handleRetry} />
        )}

        {screenState === 'empty' && summary && (
          <>
            {/* Stat cards still shown with ₴0 values on empty */}
            <StatCards summary={summary} />
            <BalanceEmptyState
              onNavigateToTasks={onNavigateToTasks ?? (() => {})}
            />
          </>
        )}

        {(screenState === 'populated_positive' || screenState === 'populated_negative') && summary && (
          <>
            {/* Stat Cards Row — always visible in populated states */}
            <StatCards summary={summary} />

            {/* Warning Banner — only when remaining < 0 */}
            {screenState === 'populated_negative' && (
              <WarningBanner
                overage={Math.abs(summary.remaining)}
                currency={summary.currency}
              />
            )}

            {/* Transaction History with infinite scroll */}
            <TransactionHistory
              items={allHistoryItems}
              isFetchingNextPage={historyQuery.isFetchingNextPage}
              hasNextPage={historyQuery.hasNextPage}
              fetchNextPage={historyQuery.fetchNextPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
