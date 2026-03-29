// src/components/screens/MyBalance/StatCard.tsx
// Traces to: Scenario §7 Stat Cards, §12.1 Spacing/Color/Typography
// Figma nodes: 73:52934 (Earned) | 73:52943 (Advances) | 73:52952 (Remaining)

import { Icon } from '@iconify/react';
import { formatMoney } from '@/utils/formatters';
import {
  STAT_ICON, STAT_ICON_COLOR, STAT_ICON_BG, STAT_AMOUNT_COLOR,
  STAT_BADGE_PX, STAT_ICON_SIZE,
  type StatCardType,
} from '@/constants/balanceIcons';

interface StatCardProps {
  label: string;
  amount: number;
  type: StatCardType;
  isNegative?: boolean; // Only meaningful for 'remaining' type (BR-W3-03)
}

export function StatCard({ label, amount, type, isNegative }: StatCardProps) {
  const icon       = STAT_ICON[type];
  const iconColor  = STAT_ICON_COLOR[type];
  const iconBg     = STAT_ICON_BG[type];

  // Remaining turns red when negative — Scenario §5.2, BR-W3-04, OQ-W3-05 confirmed
  const amountColor = type === 'remaining' && isNegative ? '#ef4444' : STAT_AMOUNT_COLOR[type];

  // Negative Remaining: "−₴4,800" (U+2212 minus) | Others: "₴18,450"
  const displayAmount =
    type === 'remaining' && isNegative
      ? `\u2212₴${Math.abs(Math.floor(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
      : formatMoney(amount);

  return (
    // Scenario §12.1: all-4-sides border (unlike W1 task cards which are left-only)
    <div className="bg-bg-card border border-[rgba(255,255,255,0.08)] rounded-[20px] p-[13px] flex flex-col gap-2 flex-1 min-w-0">

      {/* Label row: icon badge + label text */}
      {/* Gap: 6px — Scenario §12.1 Spacing "Icon-to-label gap in stat card header" */}
      <div className="flex items-center gap-[6px]">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: STAT_BADGE_PX, height: STAT_BADGE_PX, background: iconBg }}
        >
          {type === 'remaining' ? (
            // 💰 is an intentional emoji, not an Iconify icon — ADR-002-C
            <span className="text-[10px] leading-none select-none" aria-hidden="true">💰</span>
          ) : (
            <Icon icon={icon!} width={STAT_ICON_SIZE} height={STAT_ICON_SIZE} color={iconColor} />
          )}
        </div>
        {/* Stat label: 12px Regular Inter #9d9d9d — Scenario §12.1 Typography */}
        <span className="text-[12px] font-normal leading-4 text-text-secondary truncate">
          {label}
        </span>
      </div>

      {/* Amount: 18px Bold JetBrains Mono — Scenario §12.1 Typography */}
      <span
        className="font-mono font-bold text-[18px] leading-7 tracking-tight"
        style={{ color: amountColor }}
      >
        {displayAmount}
      </span>
    </div>
  );
}
