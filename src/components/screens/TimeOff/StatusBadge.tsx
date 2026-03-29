// src/components/screens/TimeOff/StatusBadge.tsx
// Traces to: Scenario §7 UI Elements, Figma nodes 113:10888/113:10894
// Status colors from §12.1: pending=#fbbf24, approved=#34d399, rejected=#ef4444

import type { LeaveStatus } from '@/types/leave.types';

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  dot?: string;
  prefix?: string;
}

const STATUS_CONFIG: Record<LeaveStatus, StatusConfig> = {
  pending:  { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', label: 'На розгляді', dot: '#fbbf24' },
  approved: { bg: 'rgba(16,185,129,0.1)',  text: '#34d399', label: 'Затверджено', prefix: '✓ ' },
  rejected: { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', label: 'Відхилено' },
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className="flex items-center"
      style={{
        background: cfg.bg,
        borderRadius: '9999px',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 2,
        paddingBottom: 2,
        gap: cfg.dot ? 4 : 0,
      }}
    >
      {cfg.dot && (
        <span
          className="shrink-0"
          style={{ width: 6, height: 6, borderRadius: '9999px', background: cfg.dot }}
        />
      )}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '16px',
          color: cfg.text,
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.prefix ?? ''}{cfg.label}
      </span>
    </div>
  );
}
