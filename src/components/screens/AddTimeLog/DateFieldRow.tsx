// src/components/screens/AddTimeLog/DateFieldRow.tsx
// Traces to: Scenario §7 UI Elements — Date Row, Figma node 255:11098
// Date chip row with native hidden input for OS date picker

import { Icon } from '@iconify/react';
import { formatDateDisplay } from '@/utils/timeUtils';

interface DateFieldRowProps {
  date: string;       // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

export function DateFieldRow({ date, onChange }: DateFieldRowProps) {
  return (
    <div className="flex items-center justify-between w-full" style={{ minHeight: 32 }}>
      {/* Left: icon + label — Figma: icon 20px #ededed, Inter Regular 17px, gap 12px */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <Icon icon="radix-icons:calendar" width={20} color="#ededed" />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 17,
            fontWeight: 400,
            lineHeight: '20.4px',
            letterSpacing: '-0.43px',
            color: '#ededed',
          }}
        >
          Дата
        </span>
      </div>

      {/* Right: styled chip + hidden native date picker (ADR-005-C) */}
      <div className="relative">
        {/* Visible chip: bg #3e3e42, rounded 10px, Space Grotesk 15px Medium */}
        <div
          className="flex items-center"
          style={{
            background: '#3e3e42',
            borderRadius: 10,
            paddingInline: 12,
            paddingBlock: 8,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: '18px',
            color: '#ededed',
            whiteSpace: 'nowrap',
          }}
        >
          {date ? formatDateDisplay(date) : 'Оберіть дату'}
        </div>
        {/* Native input — positioned over chip, transparent */}
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Оберіть дату"
        />
      </div>
    </div>
  );
}
