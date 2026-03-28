// BalanceHeader — Tech Stack § Phase 4 + Scenario § UI Elements
// Node: I113:10273;110:8177 (title), I113:10273;110:8183 (period), I113:10273;110:8196 (info btn)

import { Info } from 'lucide-react';

interface BalanceHeaderProps {
  period: string; // e.g. "2026-03"
  onInfoClick: () => void;
}

const MONTH_NAMES_UK: Record<string, string> = {
  '01': 'Січень',
  '02': 'Лютий',
  '03': 'Березень',
  '04': 'Квітень',
  '05': 'Травень',
  '06': 'Червень',
  '07': 'Липень',
  '08': 'Серпень',
  '09': 'Вересень',
  '10': 'Жовтень',
  '11': 'Листопад',
  '12': 'Грудень',
};

function formatPeriodLabel(period: string): string {
  // period is "YYYY-MM"
  const [year, month] = period.split('-');
  const monthName = MONTH_NAMES_UK[month] ?? month;
  return `${monthName} ${year}`;
}

export function BalanceHeader({ period, onInfoClick }: BalanceHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 h-[68px] flex items-center justify-between shadow-sm max-w-[420px] mx-auto">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[18px] font-semibold text-content-primary tracking-tight leading-tight">
          Мій баланс
        </h1>
        <span
          className="text-[12px] text-content-tertiary font-normal leading-tight"
          aria-label={`Розрахунковий період: ${formatPeriodLabel(period)}`}
        >
          {formatPeriodLabel(period)}
        </span>
      </div>

      {/* Info Button — 32×32px, rounded-full, white bg — Figma node I113:10273;110:8196 */}
      <button
        id="balance-info-btn"
        onClick={onInfoClick}
        aria-label="Інформація про розрахунок балансу"
        className="size-8 rounded-full bg-white flex items-center justify-center shadow-card active:scale-95 transition-transform min-w-[32px] min-h-[32px]"
      >
        <Info size={16} className="text-bg-primary" strokeWidth={2.5} />
      </button>
    </header>
  );
}
