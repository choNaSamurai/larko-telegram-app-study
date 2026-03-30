// src/components/screens/AddTimeLog/UnitsField.tsx
// Traces to: Scenario §5.1 — Per-Unit Variant B, Figma node 307:48128
// Only rendered when isPerUnit === true

import { Icon } from '@iconify/react';

interface UnitsFieldProps {
  value: number;
  unitLabel: string;  // e.g., "м²", "шт"
  onChange: (n: number) => void;
}

export function UnitsField({ value, unitLabel, onChange }: UnitsFieldProps) {
  return (
    <div className="flex items-center justify-between w-full" style={{ minHeight: 32 }}>
      {/* Left: icon + label */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <Icon icon="material-symbols:check-circle-outline" width={20} color="#ededed" />
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
          Виконано
        </span>
      </div>

      {/* Right: units chip + hidden number input */}
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
          {Math.round(value)} {unitLabel}
        </div>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={`Кількість виконаних ${unitLabel}`}
        />
      </div>
    </div>
  );
}
