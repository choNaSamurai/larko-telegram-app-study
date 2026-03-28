// RemainingCard — Tech Stack § Phase 4 + Scenario § UI Elements
// Figma node: 73:52952 — 108px wide, 86px tall
// variant='positive': coin emoji + white amount
// variant='negative': red warning icon + red amount + red bg tint

import { AlertTriangle } from 'lucide-react';

interface RemainingCardProps {
  amount: number;
  currency: string;
  variant: 'positive' | 'negative';
}

function formatAmount(amount: number): string {
  return Math.abs(amount).toLocaleString('uk-UA');
}

export function RemainingCard({ amount, currency, variant }: RemainingCardProps) {
  const symbol = currency === 'UAH' ? '₴' : currency;
  const isNegative = variant === 'negative';

  return (
    <div
      className={`flex-1 rounded-xl h-[86px] relative overflow-hidden ${
        isNegative ? 'bg-status-error/10' : 'bg-bg-card'
      }`}
      aria-label={`Залишок: ${isNegative ? 'мінус ' : ''}${formatAmount(amount)} ${
        currency === 'UAH' ? 'гривень' : currency
      }`}
    >
      {/* Background tint */}
      <div
        className={`absolute inset-0 rounded-xl ${
          isNegative ? 'bg-status-error/5' : 'bg-content-primary/3'
        }`}
      />

      <div className="relative p-[13px] flex flex-col gap-0">
        {/* Icon row */}
        <div className="flex items-center gap-[6px] mb-[8px]">
          {isNegative ? (
            <div className="size-6 rounded-full bg-status-error/20 flex items-center justify-center">
              <AlertTriangle size={14} className="text-status-error" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="size-6 flex items-center justify-center">
              <span className="text-[16px] leading-none">💰</span>
            </div>
          )}
          <span className="text-xs text-content-secondary font-medium leading-none">
            Залишок
          </span>
        </div>

        {/* Amount — JetBrains Mono Bold per NFR §11 */}
        <p
          className={`text-[18px] leading-[28px] truncate ${
            isNegative ? 'text-status-error' : 'text-content-primary'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
        >
          {isNegative ? '−' : ''}{symbol}{formatAmount(amount)}
        </p>
      </div>
    </div>
  );
}
