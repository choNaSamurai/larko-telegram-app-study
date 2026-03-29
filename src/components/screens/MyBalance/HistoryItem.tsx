// src/components/screens/MyBalance/HistoryItem.tsx
// Traces to: Scenario §7 History item rows, §12.1 Spacing/Typography/Icons
// Figma nodes: 73:52965 (earned) | 73:52976 (advance) | 73:52998 (overtime)

import { Icon } from '@iconify/react';
import { formatSignedMoney } from '@/utils/formatters';
import {
  HISTORY_ICON, HISTORY_ICON_COLOR, HISTORY_ICON_BG, HISTORY_AMOUNT_COLOR,
  HIST_BADGE_PX, HIST_ICON_SIZE,
} from '@/constants/balanceIcons';
import type { BalanceHistoryItem } from '@/types/balance.types';

interface HistoryItemProps {
  item: BalanceHistoryItem;
  isLast: boolean;
}

export function HistoryItem({ item, isLast }: HistoryItemProps) {
  const icon        = HISTORY_ICON[item.type];
  const iconColor   = HISTORY_ICON_COLOR[item.type];
  const iconBg      = HISTORY_ICON_BG[item.type];
  const amountColor = HISTORY_AMOUNT_COLOR[item.type];

  return (
    // Scenario §12.1 Spacing: py-[12px] top + 13px bottom, px-4, border-b on all except last
    <div
      className={[
        'flex items-center gap-3 px-4 py-[12px]',
        !isLast ? 'border-b border-[rgba(255,255,255,0.08)]' : '',
      ].join(' ')}
    >
      {/* Icon badge: 36px circle — Scenario §12.1 "Icon badge size (history items)" */}
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: HIST_BADGE_PX, height: HIST_BADGE_PX, background: iconBg }}
      >
        <Icon icon={icon} width={HIST_ICON_SIZE} height={HIST_ICON_SIZE} color={iconColor} />
      </div>

      {/* Name + meta — flex-1 with truncation */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Name: 14px Medium Inter #ededed, 1 line truncated — Scenario §12.1 */}
        <p className="text-[14px] font-medium leading-5 text-text-primary truncate">
          {item.name}
        </p>
        {/* Meta: 12px Regular #9d9d9d, format "23 бер · 9.0 год" or "22 бер" */}
        <p className="text-[12px] font-normal leading-4 text-text-secondary">
          {item.date}{item.hours ? ` · ${item.hours}` : ''}
        </p>
      </div>

      {/* Signed amount: 14px Bold JetBrains Mono, right-aligned, color by type */}
      {/* Scenario §12.1 Typography "History item amount" */}
      <span
        className="font-mono font-bold text-[14px] leading-5 shrink-0"
        style={{ color: amountColor }}
      >
        {formatSignedMoney(item.amount)}
      </span>
    </div>
  );
}
