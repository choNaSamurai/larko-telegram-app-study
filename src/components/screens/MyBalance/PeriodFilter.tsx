// src/components/screens/MyBalance/PeriodFilter.tsx
// Traces to: Scenario §5 (OQ-W3-01 answered: Period filter IS included), §12.1 Spacing
// ADR-002-B: Zustand store for period (persists across tab nav)

import { useBalancePeriodStore } from '@/stores/useBalancePeriodStore';
import type { BalancePeriod } from '@/types/balance.types';

const PERIODS: { key: BalancePeriod; label: string }[] = [
  { key: 'week',  label: 'Цей тиждень' },
  { key: 'month', label: 'Цей місяць' },
  { key: 'all',   label: 'Весь час' },
];

export function PeriodFilter() {
  const { activePeriod, setPeriod } = useBalancePeriodStore();

  return (
    // Horizontal scroll, px-4 padding, same pill style as W1 FilterTabs
    <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setPeriod(key)}
          className={[
            'px-4 py-1.5 rounded-full text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors',
            activePeriod === key
              ? 'bg-white text-text-dark'
              : 'border border-text-muted text-text-muted',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
