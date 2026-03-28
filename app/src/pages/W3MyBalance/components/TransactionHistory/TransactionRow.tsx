// TransactionRow — Tech Stack § Phase 4 + Scenario § UI Elements
// Polymorphic row: switches icon/color/prefix by TransactionType
// Figma: 358×61px per row, icon 36×36px, amount in monospace

import { ArrowUpRight, ArrowDownLeft, Clock, SlidersHorizontal } from 'lucide-react';
import type { TransactionItem } from '../../../../types/balance';

interface TransactionRowProps {
  item: TransactionItem;
}

const TYPE_CONFIG = {
  earning: {
    iconBg: 'bg-status-success/15',
    icon: ArrowUpRight,
    iconColor: 'text-status-success',
    amountColor: 'text-status-success',
    prefix: '+',
  },
  advance: {
    iconBg: 'bg-status-info/15',
    icon: ArrowDownLeft,
    iconColor: 'text-status-info',
    amountColor: 'text-status-info',
    prefix: '−',
  },
  overtime: {
    iconBg: 'bg-status-warning/15',
    icon: Clock,
    iconColor: 'text-status-warning',
    amountColor: 'text-status-warning',
    prefix: '+',
  },
  adjustment: {
    iconBg: 'bg-content-secondary/15',
    icon: SlidersHorizontal,
    iconColor: 'text-content-secondary',
    amountColor: 'text-content-primary',
    prefix: '+',
  },
} as const;

function formatDate(isoDate: string): string {
  // "2026-03-23" → "23 бер"
  const months: Record<string, string> = {
    '01': 'січ', '02': 'лют', '03': 'бер', '04': 'квіт',
    '05': 'трав', '06': 'черв', '07': 'лип', '08': 'серп',
    '09': 'вер', '10': 'жовт', '11': 'лист', '12': 'груд',
  };
  const [, m, d] = isoDate.split('-');
  return `${parseInt(d)} ${months[m] ?? m}`;
}

function buildSubLabel(item: TransactionItem): string {
  const dateStr = formatDate(item.date);

  if (item.type === 'earning') {
    return item.hours != null ? `${dateStr} · ${item.hours.toFixed(1)} год` : dateStr;
  }
  if (item.type === 'overtime') {
    const hoursStr = item.hours != null ? `${item.hours.toFixed(1)} год` : '';
    const multStr = item.multiplier != null ? ` × ${item.multiplier}` : '';
    return `${dateStr} · ${hoursStr}${multStr}`;
  }
  // advance / adjustment
  return dateStr;
}

function buildPrimaryLabel(item: TransactionItem): string {
  if (item.type === 'advance') return 'Аванс';
  if (item.type === 'overtime' && item.orderName) return `Овертайм · ${item.orderName}`;
  if (item.type === 'adjustment') return item.orderName ?? 'Коригування';
  return item.orderName ?? '—';
}

export function TransactionRow({ item }: TransactionRowProps) {
  const config = TYPE_CONFIG[item.type];
  const IconComponent = config.icon;
  const primaryLabel = buildPrimaryLabel(item);
  const subLabel = buildSubLabel(item);
  const amountStr = `${config.prefix}₴${item.amount.toLocaleString('uk-UA')}`;

  return (
    <div className="flex items-center gap-3 py-[12px] border-b border-white/[0.05] last:border-b-0">
      {/* Circle icon — 36×36px */}
      <div
        className={`size-9 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
      >
        <IconComponent size={18} className={config.iconColor} strokeWidth={2} />
      </div>

      {/* Text block — flex-1, truncated order name */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-content-primary leading-[20px] truncate">
          {primaryLabel}
        </p>
        <p className="text-[12px] text-content-secondary leading-[16px]">
          {subLabel}
        </p>
      </div>

      {/* Amount — monospace, right-aligned */}
      <span
        className={`text-[14px] shrink-0 ${config.amountColor}`}
        style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
      >
        {amountStr}
      </span>
    </div>
  );
}
