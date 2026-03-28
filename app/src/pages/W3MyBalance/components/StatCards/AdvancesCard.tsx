// AdvancesCard — Tech Stack § Phase 4 + Scenario § UI Elements
// Figma node: 73:52943 — 99px wide, 86px tall, blue icon + amount in #60a5fa

import { ArrowDownLeft } from 'lucide-react';

interface AdvancesCardProps {
  amount: number;
  currency: string;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('uk-UA');
}

export function AdvancesCard({ amount, currency }: AdvancesCardProps) {
  const symbol = currency === 'UAH' ? '₴' : currency;

  return (
    <div
      className="flex-1 bg-bg-card rounded-xl h-[86px] relative overflow-hidden"
      aria-label={`Аванси: ${formatAmount(amount)} ${currency === 'UAH' ? 'гривень' : currency}`}
    >
      {/* Subtle blue glow backdrop */}
      <div className="absolute inset-0 bg-status-info/5 rounded-xl" />

      <div className="relative p-[13px] flex flex-col gap-0">
        {/* Icon row */}
        <div className="flex items-center gap-[6px] mb-[8px]">
          <div className="size-6 rounded-full bg-status-info/15 flex items-center justify-center">
            <ArrowDownLeft size={14} className="text-status-info" strokeWidth={2.5} />
          </div>
          <span className="text-xs text-content-secondary font-medium leading-none">
            Аванси
          </span>
        </div>

        {/* Amount — JetBrains Mono Bold per NFR §11 */}
        <p
          className="text-[18px] leading-[28px] text-status-info truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
        >
          {symbol}{formatAmount(amount)}
        </p>
      </div>
    </div>
  );
}
