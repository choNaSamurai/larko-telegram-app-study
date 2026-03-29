// src/components/screens/MyBalance/StatCards.tsx
// Traces to: Scenario §7 "Stat Cards row" (73:52933), §12.1 Spacing
// Figma: flex row, gap-4 (16px), px-4 (16px), h-[86px]

import { StatCard } from './StatCard';
import type { BalanceData } from '@/types/balance.types';

interface StatCardsProps {
  data: BalanceData;
}

export function StatCards({ data }: StatCardsProps) {
  const isNegative = data.remaining < 0;
  return (
    // gap-4 = 16px — Scenario §12.1 "Stat Cards gap between cards"
    // px-4  = 16px — Scenario §12.1 "Screen horizontal padding"
    <div className="flex gap-4 px-4">
      <StatCard label="Зароблено" amount={data.earned}    type="earned" />
      <StatCard label="Аванси"    amount={data.advances}  type="advances" />
      <StatCard label="Залишок"   amount={data.remaining} type="remaining" isNegative={isNegative} />
    </div>
  );
}
