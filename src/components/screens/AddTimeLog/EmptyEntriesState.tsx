// src/components/screens/AddTimeLog/EmptyEntriesState.tsx
// Traces to: Scenario §8 State "Empty", Figma node 261:11397
// Shows when no time log entries exist for the selected date

import { Icon } from '@iconify/react';

export function EmptyEntriesState() {
  return (
    <div
      style={{
        background: '#2d2d31',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingBlock: 32,
        paddingInline: 16,
        width: '100%',
      }}
    >
      {/* Icon container — bg #3e3e42, 64px circle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#3e3e42',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* material-symbols:work-history-outline icon (Figma data-name) */}
        <Icon
          icon="material-symbols:work-history-outline"
          width={32}
          height={32}
          color="#878787"
        />
      </div>

      {/* Title */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 500,
          lineHeight: '20px',
          color: '#ededed',
        }}
      >
        Немає записів
      </p>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: '18px',
          color: '#878787',
          textAlign: 'center',
          maxWidth: 240,
        }}
      >
        За обраний день ще нічого не додано
      </p>
    </div>
  );
}
