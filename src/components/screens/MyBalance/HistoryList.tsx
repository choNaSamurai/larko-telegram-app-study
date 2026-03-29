// src/components/screens/MyBalance/HistoryList.tsx
// Traces to: Scenario §7 "History section header" (73:52963), §4 Main Flow step 5
// OQ-W3-04 confirmed: fully scrollable, no pagination

import { HistoryItem } from './HistoryItem';
import type { BalanceHistoryItem } from '@/types/balance.types';

interface HistoryListProps {
  items: BalanceHistoryItem[];
}

export function HistoryList({ items }: HistoryListProps) {
  return (
    <div className="flex flex-col">
      {/* Section header: 14px SemiBold #ededed — Scenario §12.1 Typography */}
      {/* ml-4 (16px) mb-[12px] — Scenario §12.1 Spacing */}
      <p className="px-4 pb-[12px] text-[14px] font-semibold leading-5 text-text-primary">
        Історія операцій
      </p>

      {/* History rows — OQ-W3-04: all items rendered, list is scrollable in parent */}
      {items.map((item, idx) => (
        <HistoryItem
          key={item.id}
          item={item}
          isLast={idx === items.length - 1}
        />
      ))}
    </div>
  );
}
