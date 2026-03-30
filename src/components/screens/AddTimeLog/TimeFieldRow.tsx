// src/components/screens/AddTimeLog/TimeFieldRow.tsx
// Traces to: Scenario §7 — Start/End rows, Figma nodes 255:11108, 255:11121
// Time chip row with hidden native time picker (ADR-005-C)

import { Icon } from '@iconify/react';

interface TimeFieldRowProps {
  label: string;      // "Початок" | "Кінець"
  value: string;      // "HH:MM" 24h format
  onChange: (time: string) => void;
}

export function TimeFieldRow({ label, value, onChange }: TimeFieldRowProps) {
  return (
    <div className="flex items-center justify-between w-full" style={{ minHeight: 32 }}>
      {/* Left: icon + label — Figma: mingcute:time-line 20px #ededed, Inter Regular 17px */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <Icon icon="mingcute:time-line" width={20} color="#ededed" />
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
          {label}
        </span>
      </div>

      {/* Right: time chip + hidden native time picker */}
      <div className="relative">
        <div
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
            minWidth: 76,
            textAlign: 'center',
          }}
        >
          {value || '--:--'}
        </div>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={label}
        />
      </div>
    </div>
  );
}
