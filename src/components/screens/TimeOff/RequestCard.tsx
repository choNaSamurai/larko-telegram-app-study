// src/components/screens/TimeOff/RequestCard.tsx
// Traces to: Scenario §7 "Request 1: Pending" / "Request 2: Approved", Figma nodes 73:54625/73:54635
// CRITICAL: h=99px, absolute positioning top-16/45/65, bg #2d2d31, rounded-20px

import { StatusBadge } from './StatusBadge';
import { formatDateRange } from '@/utils/calendarUtils';
import type { LeaveRequest } from '@/types/leave.types';

export function RequestCard({ req }: { req: LeaveRequest }) {
  const dateLabel = formatDateRange(req.startDate, req.endDate, req.durationDays);

  return (
    <div
      className="relative w-full shrink-0"
      style={{
        height: 99,
        background: '#2d2d31',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
      }}
    >
      {/* Top row: type + badge — absolute top-16px, left-16px, right-16px */}
      <div
        className="absolute flex items-center justify-between"
        style={{ top: 16, left: 16, right: 16 }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#ededed', whiteSpace: 'nowrap' }}
        >
          {req.type}
        </span>
        <StatusBadge status={req.status} />
      </div>

      {/* Date range — absolute top-45px */}
      <div className="absolute" style={{ top: 45, left: 16, right: 16 }}>
        <p
          style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#878787', whiteSpace: 'nowrap' }}
        >
          {dateLabel}
        </p>
      </div>

      {/* Reason — absolute top-65px */}
      {req.reason && (
        <div className="absolute overflow-hidden" style={{ top: 65, left: 16, right: 16 }}>
          <p
            className="truncate"
            style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#878787' }}
          >
            {req.reason}
          </p>
        </div>
      )}
    </div>
  );
}
