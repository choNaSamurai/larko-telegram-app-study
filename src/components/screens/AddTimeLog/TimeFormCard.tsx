// src/components/screens/AddTimeLog/TimeFormCard.tsx
// Traces to: Scenario §7 — Card 7 (form card), Figma node 255:11097
// The main form card: Date / Start / End / Breaks / Comment / NetHours / Save

import { Icon } from '@iconify/react';
import type { UseTimeLogFormReturn } from '@/hooks/useTimeLogForm';
import { DateFieldRow } from './DateFieldRow';
import { TimeFieldRow } from './TimeFieldRow';
import { BreakRow } from './BreakRow';
import { NetHoursSummaryBar } from './NetHoursSummaryBar';
import { UnitsField } from './UnitsField';

interface TimeFormCardProps {
  hook: UseTimeLogFormReturn;
  isPerUnit: boolean;
  unitLabel?: string;
  onSave: () => void;
  isSaving: boolean;
}

export function TimeFormCard({
  hook,
  isPerUnit,
  unitLabel = 'м²',
  onSave,
  isSaving,
}: TimeFormCardProps) {
  const {
    form, netMinutes, isValid, errors,
    setDate, setWorkStart, setWorkEnd,
    addBreak, removeBreak, updateBreak,
    setComment, setUnitsCompleted,
    canAddBreak,
  } = hook;

  const breakError = errors.find(
    (e) => e.field === 'break-overlap' || e.field === 'break-time'
  )?.message;

  const netError = errors.find((e) => e.field === 'net')?.message;

  return (
    <div
      style={{
        background: '#2d2d31',
        borderRadius: 20,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      {/* Date row */}
      <DateFieldRow date={form.logDate} onChange={setDate} />

      {/* Divider — 1px rgba(255,255,255,0.08) */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', width: '100%' }} />

      {/* Work start */}
      <TimeFieldRow label="Початок" value={form.workStart} onChange={setWorkStart} />

      {/* Work end */}
      <TimeFieldRow label="Кінець" value={form.workEnd} onChange={setWorkEnd} />

      {/* Break pairs (up to 5) */}
      {form.breaks.map((bp, idx) => (
        <BreakRow
          key={bp.id}
          breakPair={bp}
          index={idx}
          onUpdate={updateBreak}
          onRemove={removeBreak}
          error={idx === 0 ? breakError : undefined}
        />
      ))}

      {/* Add break link — hidden when MAX_BREAKS reached */}
      {canAddBreak && (
        <button
          onClick={addBreak}
          className="w-full text-center transition-opacity active:opacity-70"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: '20.4px',
            letterSpacing: '-0.43px',
            color: '#878787',
          }}
        >
          + Додати перерву
        </button>
      )}

      {/* Divider before units field — only for Per-Unit variant */}
      {isPerUnit && (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', width: '100%' }} />
      )}

      {/* Units completed — only for Per-Unit orders (Variant B) */}
      {isPerUnit && (
        <UnitsField
          value={form.unitsCompleted ?? 0}
          unitLabel={unitLabel}
          onChange={setUnitsCompleted}
        />
      )}

      {/* Comment textarea */}
      <textarea
        value={form.comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Додайте коментар (необов'язково)"
        rows={2}
        style={{
          background: '#3e3e42',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 13,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 400,
          lineHeight: '18px',
          letterSpacing: '-0.23px',
          color: '#ededed',
          resize: 'none',
          width: '100%',
          outline: 'none',
          minHeight: 48,
          boxSizing: 'border-box',
        }}
        className="placeholder-text-muted"
      />

      {/* Net hours error message */}
      {netError && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#fbbf24',
            textAlign: 'center',
          }}
        >
          {netError}
        </p>
      )}

      {/* "Відпрацьовано" summary bar */}
      <NetHoursSummaryBar
        netMinutes={netMinutes}
        isPerUnit={isPerUnit}
        unitsCompleted={form.unitsCompleted}
        unitLabel={unitLabel}
      />

      {/* Save button — white pill, full width, 48px, Inter SemiBold 17px */}
      <button
        onClick={onSave}
        disabled={!isValid || isSaving}
        className="flex items-center justify-center transition-opacity active:opacity-80"
        style={{
          gap: 8,
          height: 48,
          width: '100%',
          borderRadius: 32,
          background: !isValid || isSaving ? 'rgba(255,255,255,0.25)' : '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 17,
          fontWeight: 600,
          lineHeight: '20.4px',
          letterSpacing: '-0.43px',
          color: '#222226',
          border: 'none',
          cursor: !isValid || isSaving ? 'not-allowed' : 'pointer',
        }}
        aria-label="Зберегти запис"
      >
        {/* fluent:save-16-regular icon (Figma node data-name) */}
        <Icon
          icon="fluent:save-20-regular"
          width={22}
          height={22}
          color={!isValid || isSaving ? 'rgba(34,34,38,0.5)' : '#222226'}
        />
        {isSaving ? 'Збереження...' : 'Зберегти'}
      </button>
    </div>
  );
}
