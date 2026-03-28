// WarningBanner — Tech Stack § Phase 4
// Figma: node 73:53369 (dark) / 73:53486 (light)
// 358×78px, rounded, orange/red bg, only visible when remaining < 0

import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  overage: number; // absolute value of the negative remaining amount
  currency: string;
}

export function WarningBanner({ overage, currency }: WarningBannerProps) {
  const symbol = currency === 'UAH' ? '₴' : currency;
  const formattedOverage = Math.abs(overage).toLocaleString('uk-UA');

  return (
    <div className="mx-4">
      <div
        className="w-full rounded-xl bg-status-error/10 border border-status-error/20 px-4 py-3 flex items-start gap-3"
        role="alert"
        aria-live="polite"
      >
        {/* Warning icon — centered vertically relative to title */}
        <div className="mt-[3px] size-[18px] flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-status-warning" strokeWidth={2} />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-semibold text-content-primary leading-[20px]">
            Від'ємний баланс
          </p>
          <p className="text-[12px] text-content-secondary leading-[16px]">
            Аванси перевищують заробіток на {symbol}{formattedOverage}
          </p>
        </div>
      </div>
    </div>
  );
}
