// EarnedCard — Tech Stack § Phase 4 + Scenario § UI Elements
// Figma node: 73:52934 — 120px wide, 86px tall, green icon + amount in #34d399

import { TrendingUp } from 'lucide-react';

interface EarnedCardProps {
  amount: number;
  currency: string;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('uk-UA');
}

export function EarnedCard({ amount, currency }: EarnedCardProps) {
  const symbol = currency === 'UAH' ? '₴' : currency;

  return (
    <div
      className="flex-1 bg-bg-card rounded-xl h-[86px] relative overflow-hidden"
      aria-label={`Зароблено: ${formatAmount(amount)} ${currency === 'UAH' ? 'гривень' : currency}`}
    >
      {/* Subtle green glow backdrop */}
      <div className="absolute inset-0 bg-status-success/5 rounded-xl" />

      <div className="relative p-[13px] flex flex-col gap-0">
        {/* Icon row */}
        <div className="flex items-center gap-[6px] mb-[8px]">
          <div className="size-6 rounded-full bg-status-success/15 flex items-center justify-center">
            <TrendingUp size={14} className="text-status-success" strokeWidth={2.5} />
          </div>
          <span className="text-xs text-content-secondary font-medium leading-none">
            Зароблено
          </span>
        </div>

        {/* Amount — JetBrains Mono Bold per NFR §11 */}
        <p
          className="text-[18px] leading-[28px] text-status-success truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
        >
          {symbol}{formatAmount(amount)}
        </p>
      </div>
    </div>
  );
}
