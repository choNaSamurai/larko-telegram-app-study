// src/components/screens/TimeOff/MiniCalendar.tsx
// Traces to: Scenario §4 Step 6, §12.1, Figma node 73:54503, ADR-003-C
// CRITICAL: bg #2d2d31, border rgba(255,255,255,0.08), rounded-20px, h-290px
// Today cell: bg white, text #222226, semibold, rounded-16px
// Absence dot: 4px rounded-full, bottom-2px, centered
// Day grid: 7 cols, gap 4px, cell height 28px (py-6px + 16px text)

import { Icon } from '@iconify/react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { buildCalendarDays, formatMonthLabel, getTodayISO } from '@/utils/calendarUtils';
import type { CalendarDot } from '@/types/leave.types';

const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

interface MiniCalendarProps {
  dots: CalendarDot[];
}

export function MiniCalendar({ dots }: MiniCalendarProps) {
  const { year, month, prevMonth, nextMonth } = useCalendarStore();
  const today = getTodayISO();
  const cells = buildCalendarDays(year, month);

  // Build dot lookup: date → status
  const dotMap = new Map(dots.map(d => [d.date, d.status]));

  return (
    <div
      className="relative mx-4"
      style={{
        background: '#2d2d31',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        minHeight: 290,
        padding: '16px 16px 16px',
      }}
    >
      {/* Month navigation header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <button
          onClick={prevMonth}
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: '9999px' }}
        >
          <Icon icon="solar:alt-arrow-left-bold" width={18} style={{ color: '#ededed' }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#ededed' }}>
          {formatMonthLabel(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: '9999px' }}
        >
          <Icon icon="solar:alt-arrow-right-bold" width={18} style={{ color: '#ededed' }} />
        </button>
      </div>

      {/* Day-of-week header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 4,
          marginBottom: 4,
          height: 16,
        }}
      >
        {DOW_LABELS.map(d => (
          <span
            key={d}
            className="text-center"
            style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#878787' }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Calendar day grid — 6 rows × 7 cols */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 4,
        }}
      >
        {cells.map((cell, idx) => {
          const isToday = cell.isCurrentMonth && cell.isoDate === today;
          const dot = dotMap.get(cell.isoDate);

          return (
            <div
              key={idx}
              className="relative flex flex-col items-center"
              style={{ paddingTop: 6, paddingBottom: 6 }}
            >
              {/* Day number */}
              <span
                className="text-center w-full"
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 600 : 400,
                  lineHeight: '16px',
                  color: isToday ? '#222226' : cell.isCurrentMonth ? '#ededed' : '#878787',
                  background: isToday ? '#ffffff' : 'transparent',
                  borderRadius: isToday ? 16 : 0,
                }}
              >
                {cell.dayNum}
              </span>

              {/* Absence dot — 4px, absolutely positioned bottom 2px */}
              {dot && (
                <span
                  className="absolute"
                  style={{
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '9999px',
                    background: dot === 'approved' ? '#34d399' : '#fbbf24',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
