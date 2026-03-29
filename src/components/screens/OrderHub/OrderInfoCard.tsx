// src/components/screens/OrderHub/OrderInfoCard.tsx
// Traces to: Scenario §4 Step 3 Block 1, §7 UI Elements, §12.1 Card Border Style
// CRITICAL: border-left ONLY — NOT all 4 sides

import { Icon } from '@iconify/react';
import { formatMoney, formatDeadline } from '@/utils/formatters';
import type { OrderDetail } from '@/types/order.types';
import {
  STATUS_BORDER_COLOR,
  STATUS_BADGE_BG,
  STATUS_BADGE_TEXT_COLOR,
  STATUS_BADGE_LABEL,
} from '@/constants/statusConfig';

type OrderInfoCardProps = Pick<OrderDetail, 'name' | 'status' | 'deadline' | 'amount'>;

export function OrderInfoCard({ name, status, deadline, amount }: OrderInfoCardProps) {
  const { label: deadlineLabel, isOverdue } = formatDeadline(deadline);
  const isDone = status === 'done';

  return (
    // border-l = left border ONLY — critical per ADR + W1 post-mortem rule
    <div
      className="mx-4 bg-bg-card rounded-card flex flex-col gap-3 pl-[17px] pr-4 py-4"
      style={{ borderLeft: `1px solid ${STATUS_BORDER_COLOR[status]}` }}
    >
      {/* Row 1: Order name + Status badge */}
      <div className="flex items-start justify-between gap-2">
        {/* Order name — Inter SemiBold 17px — Traces to §12.1 Typography Table */}
        <h4
          className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px] flex-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {name}
        </h4>

        {/* Status badge — colored pill */}
        <span
          className="rounded-badge px-[10px] py-[2px] text-[12px] font-medium whitespace-nowrap shrink-0 flex items-center gap-[4px] leading-[16px]"
          style={{
            background: STATUS_BADGE_BG[status],
            color: STATUS_BADGE_TEXT_COLOR[status],
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Dot indicator — not shown for done (which has checkmark in label) */}
          {!isDone && (
            <span
              className="inline-block w-[6px] h-[6px] rounded-full shrink-0"
              style={{ background: STATUS_BADGE_TEXT_COLOR[status] }}
            />
          )}
          {STATUS_BADGE_LABEL[status]}
        </span>
      </div>

      {/* Row 2: Deadline + Amount */}
      <div className="flex items-center justify-between">
        {/* Deadline: calendar icon + date — Traces to §12.1 Label/Large 13px */}
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:calendar-date-bold"
            width={16}
            color={isOverdue ? '#f87171' : '#ededed'}
          />
          <span
            className="text-[13px] font-medium leading-[15.6px] tracking-[-0.08px]"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: isOverdue ? '#f87171' : '#ededed',
            }}
          >
            {/* Figma text: "до 20 березня" — strip "До " prefix, lowercased "до" */}
            до {deadlineLabel.replace('До ', '')}
          </span>
        </div>

        {/* Amount — Space Grotesk Medium 24px — Traces to §12.1 Data/Regular */}
        {/* CRITICAL: Space Grotesk — NOT Inter */}
        <span
          className="font-medium text-[24px] leading-[28.8px] text-text-primary"
          style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}
        >
          {formatMoney(amount)}
        </span>
      </div>
    </div>
  );
}
