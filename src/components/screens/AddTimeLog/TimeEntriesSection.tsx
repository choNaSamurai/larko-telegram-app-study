// src/components/screens/AddTimeLog/TimeEntriesSection.tsx
// Traces to: Scenario §7 — Records section, Figma node 255:11140
// Displays the "Records for [date]" header + list of TimeEntryCards or empty state

import { TimeEntryCard } from './TimeEntryCard';
import { EmptyEntriesState } from './EmptyEntriesState';
import type { TimeLogEntry } from '@/types/timeLog.types';
import { formatDateDisplay } from '@/utils/timeUtils';

interface TimeEntriesSectionProps {
  date: string;
  entries: TimeLogEntry[];
  onEdit?: (entry: TimeLogEntry) => void;
}

export function TimeEntriesSection({ date, entries, onEdit }: TimeEntriesSectionProps) {
  // Aggregate total hours across all entries
  const totalHours = entries.reduce((sum, e) => sum + e.netHours, 0);
  const totalStr = totalHours > 0 ? `${totalHours.toFixed(1)} год` : undefined;

  // Format date for header: "Записи за 27 березня" (strip "сьогодні, " prefix if present)
  const dateLabel = formatDateDisplay(date).replace('сьогодні, ', '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 28,
          paddingInline: 4,
        }}
      >
        {/* Title: Inter SemiBold 18px */}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            lineHeight: '28px',
            letterSpacing: '-0.44px',
            color: '#ffffff',
          }}
        >
          Записи за {dateLabel}
        </span>

        {/* Total hours (right) — Inter Regular 15px, shown only when entries exist */}
        {totalStr && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 400,
              lineHeight: '18px',
              color: '#878787',
            }}
          >
            {totalStr}
          </span>
        )}
      </div>

      {/* Entry cards or empty state */}
      {entries.length === 0 ? (
        <EmptyEntriesState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((entry) => (
            <TimeEntryCard key={entry.id} entry={entry} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
