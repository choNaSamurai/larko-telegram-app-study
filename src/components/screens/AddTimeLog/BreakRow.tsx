// src/components/screens/AddTimeLog/BreakRow.tsx
// Traces to: Scenario §5.3 Alternative Flow — Adding Breaks, BR-TL-004
// Single break pair: breakStart + breakEnd time chips + remove button

import type { BreakPair } from '@/types/timeLog.types';

interface BreakRowProps {
  breakPair: BreakPair;
  index: number;
  onUpdate: (id: string, field: 'breakStart' | 'breakEnd', value: string) => void;
  onRemove: (id: string) => void;
  error?: string;
}

export function BreakRow({ breakPair, index, onUpdate, onRemove, error }: BreakRowProps) {
  const chipStyle = {
    background: '#3e3e42',
    borderRadius: 10,
    paddingInline: 10,
    paddingBlock: 7,
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '18px',
    color: '#ededed',
    minWidth: 68,
    textAlign: 'center' as const,
  };

  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        {/* Label */}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 400,
            color: '#878787',
            whiteSpace: 'nowrap',
            minWidth: 72,
          }}
        >
          Перерва {index + 1}
        </span>

        {/* Break Start chip */}
        <div className="relative flex-1">
          <div style={chipStyle}>
            {breakPair.breakStart || '--:--'}
          </div>
          <input
            type="time"
            value={breakPair.breakStart}
            onChange={(e) => onUpdate(breakPair.id, 'breakStart', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={`Початок перерви ${index + 1}`}
          />
        </div>

        {/* Separator */}
        <span style={{ color: '#878787', fontSize: 14 }}>—</span>

        {/* Break End chip */}
        <div className="relative flex-1">
          <div style={chipStyle}>
            {breakPair.breakEnd || '--:--'}
          </div>
          <input
            type="time"
            value={breakPair.breakEnd}
            onChange={(e) => onUpdate(breakPair.id, 'breakEnd', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={`Кінець перерви ${index + 1}`}
          />
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(breakPair.id)}
          className="flex items-center justify-center transition-opacity active:opacity-60"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171',
            fontSize: 16,
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label={`Видалити перерву ${index + 1}`}
        >
          ✕
        </button>
      </div>

      {/* Inline error (only show once — from parent, not per-row) */}
      {error && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#fbbf24',
            paddingLeft: 80,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
