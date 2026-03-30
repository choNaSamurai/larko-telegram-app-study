// src/components/screens/AddTimeLog/TimeEntryCard.tsx
// Traces to: Scenario §7 — TimeEntryCard, Figma node 265:11607
// Renders a single saved time log entry in the Records section

import { Icon } from '@iconify/react';
import { getHoursColor } from '@/utils/timeUtils';
import type { TimeLogEntry } from '@/types/timeLog.types';

interface TimeEntryCardProps {
  entry: TimeLogEntry;
  onEdit?: (entry: TimeLogEntry) => void;
}

export function TimeEntryCard({ entry, onEdit }: TimeEntryCardProps) {
  const hoursColor = getHoursColor(entry.netHours);
  const hoursStr = `${entry.netHours.toFixed(1)} год`;

  // Subtitle: "Перерва Xхв" or comment text (if any)
  const breakMinutes = entry.breaks.reduce((acc, b) => {
    if (!b.breakStart || !b.breakEnd) return acc;
    const [sh, sm] = b.breakStart.split(':').map(Number);
    const [eh, em] = b.breakEnd.split(':').map(Number);
    const start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end <= start) end += 24 * 60;
    return acc + Math.max(0, end - start);
  }, 0);

  const subtitle = entry.comment
    ? entry.comment
    : breakMinutes > 0
    ? `Перерва ${breakMinutes === 60 ? '1 год' : `${breakMinutes} хв`}`
    : undefined;

  return (
    <div
      style={{
        background: '#2d2d31',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        height: 74,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 17,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: time range + optional subtitle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Time range row with clock icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 20 }}>
          <Icon icon="mingcute:time-line" width={16} color="#ededed" />
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: '18px',
              color: '#ededed',
            }}
          >
            {entry.workStart} - {entry.workEnd}
          </span>
        </div>

        {/* Subtitle (breaks / comment) */}
        {subtitle && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 400,
              lineHeight: '13.2px',
              letterSpacing: '0.06px',
              color: '#878787',
              paddingLeft: 22,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: net hours + edit icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: '18px',
            color: hoursColor,
          }}
        >
          {hoursStr}
        </span>

        {/* Pencil edit icon — Figma: PencilIcon SVG, 24px */}
        <button
          onClick={() => onEdit?.(entry)}
          className="flex items-center justify-center transition-opacity active:opacity-60"
          style={{ width: 24, height: 24 }}
          aria-label="Редагувати запис"
        >
          <Icon icon="material-symbols:edit-outline-rounded" width={22} color="#ededed" />
        </button>
      </div>
    </div>
  );
}
