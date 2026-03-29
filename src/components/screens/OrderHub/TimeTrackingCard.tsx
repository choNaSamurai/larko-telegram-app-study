// src/components/screens/OrderHub/TimeTrackingCard.tsx
// Traces to: Scenario §4 Step 3 Block 3, §5.2 (disabled), §5.3 (locked), §7 UI Elements
// §12.1: Space Grotesk 24px for hours, clock icon 20px

import { Icon } from '@iconify/react';
import { formatHours } from '@/utils/formatters';

interface TimeTrackingCardProps {
  totalHours: number;
  canAddTime: boolean;
  isDone: boolean;       // locked/done state — shows История only
  onAddTime: () => void;
  onViewHistory: () => void;
}

export function TimeTrackingCard({
  totalHours,
  canAddTime,
  isDone,
  onAddTime,
  onViewHistory,
}: TimeTrackingCardProps) {
  return (
    // bg-bg-card = #2d2d31, border all sides = rgba(255,255,255,0.08), rounded-card = 20px
    <div
      className="mx-4 bg-bg-card rounded-card p-[17px] flex flex-col gap-3"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Section header: clock icon + "Облік" — SemiBold 17px */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* majesticons:clock-line — exact from Figma data-name */}
          <Icon icon="majesticons:clock-line" width={20} color="#ededed" />
          <span
            className="text-text-primary font-semibold text-[17px] leading-[20.4px] tracking-[-0.43px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Облік
          </span>
        </div>
      </div>

      {/* Total hours — Space Grotesk Medium 24px — Traces to §12.1 Data/Regular */}
      {/* CRITICAL: Space Grotesk, NOT Inter */}
      <span
        className="font-medium text-[24px] leading-[28.8px] text-text-primary"
        style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}
      >
        {formatHours(totalHours)}
      </span>

      {/* Action buttons */}
      {isDone ? (
        // Locked state: single "Історія" read-only button full width
        <button
          onClick={onViewHistory}
          className="w-full h-8 rounded-[32px] flex items-center justify-center gap-2"
          style={{ background: 'rgba(82,82,82,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Icon icon="majesticons:clock-line" width={20} color="#9d9d9d" />
          <span
            className="text-text-secondary text-[15px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Історія
          </span>
        </button>
      ) : (
        <div className="flex gap-3">
          {/* History icon button — fixed 72px wide, bg #525252 */}
          <button
            onClick={onViewHistory}
            className="h-8 w-[72px] rounded-[32px] flex items-center justify-center shrink-0"
            style={{ background: '#525252' }}
            aria-label="Переглянути історію"
          >
            <Icon icon="majesticons:clock-line" width={20} color="#ededed" />
          </button>

          {/* "+ Додати" button — disabled bg changes per canAddTime */}
          <button
            onClick={canAddTime ? onAddTime : undefined}
            disabled={!canAddTime}
            className="flex-1 h-8 rounded-[32px] flex items-center justify-center gap-[6px] transition-opacity"
            style={{
              background: canAddTime ? 'rgba(82,82,82,0.3)' : 'rgba(82,82,82,0.15)',
              border: canAddTime ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
              cursor: canAddTime ? 'pointer' : 'not-allowed',
            }}
            aria-disabled={!canAddTime}
          >
            <Icon
              icon="solar:add-circle-bold"
              width={16}
              color={canAddTime ? '#fafafa' : '#525252'}
            />
            <span
              className="text-[15px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                color: canAddTime ? '#9d9d9d' : '#525252',
              }}
            >
              Додати
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
