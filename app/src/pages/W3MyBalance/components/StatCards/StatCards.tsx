// StatCards — 3-card horizontal row
// Tech Stack § Phase 4 — Stat Cards container
// Figma: div.px-5 → 3 flex-1 children at 86px tall

import { EarnedCard } from './EarnedCard';
import { AdvancesCard } from './AdvancesCard';
import { RemainingCard } from './RemainingCard';
import type { BalanceSummary } from '../../../../types/balance';

interface StatCardsProps {
  summary: BalanceSummary;
}

export function StatCards({ summary }: StatCardsProps) {
  const variant = summary.remaining < 0 ? 'negative' : 'positive';

  return (
    <div className="px-4">
      <div className="flex gap-2">
        <EarnedCard amount={summary.earned} currency={summary.currency} />
        <AdvancesCard amount={summary.advances} currency={summary.currency} />
        <RemainingCard amount={summary.remaining} currency={summary.currency} variant={variant} />
      </div>
    </div>
  );
}
