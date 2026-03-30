// src/components/screens/AddTimeLog/AddTimeLogScreen.tsx
// Traces to: Scenario §3, §4, §8 Root, ADR-005-A (full-screen route pattern)
// Full-screen modal for logging worker time on an order

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';

import { useTimeLogForm } from '@/hooks/useTimeLogForm';
import { fetchTimeLogsByDate, saveTimeLog } from '@/services/timeLogService';
import type { AddTimeLogContext } from '@/types/timeLog.types';
import type { TimeLogEntry } from '@/types/timeLog.types';

import { TimeFormCard } from './TimeFormCard';
import { TimeEntriesSection } from './TimeEntriesSection';

interface AddTimeLogScreenProps {
  context: AddTimeLogContext;
  onBack: () => void;
  onSaved?: () => void;
}

export function AddTimeLogScreen({ context, onBack, onSaved }: AddTimeLogScreenProps) {
  const { orderId, orderNumber, isPerUnit, unitLabel = 'м²' } = context;
  const queryClient = useQueryClient();

  const formHook = useTimeLogForm(isPerUnit);
  const { form } = formHook;

  // ── TMA BackButton — Traces to: Scenario §10 TMA Integration, ADR-005-A ──
  useEffect(() => {
    try {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onBack);
    } catch {
      // silently fail in browser/dev mode without TMA context
    }
    return () => {
      try {
        WebApp.BackButton.offClick(onBack);
        WebApp.BackButton.hide();
      } catch {
        // ignore
      }
    };
  }, [onBack]);

  // ── Fetch existing entries for selected order + date ──
  const { data: entries = [] } = useQuery({
    queryKey: ['time-logs', orderId, form.logDate],
    queryFn: () => fetchTimeLogsByDate(orderId, form.logDate),
    staleTime: 2 * 60 * 1000, // 2 min
  });

  // ── Save mutation ──
  const { mutate: handleSave, isPending: isSaving } = useMutation({
    mutationFn: () =>
      saveTimeLog(orderId, form, formHook.netMinutes / 60),
    onSuccess: () => {
      // Invalidate time-logs cache so OrderHub and this screen both update
      queryClient.invalidateQueries({ queryKey: ['time-logs', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      onSaved?.();
      onBack();
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        alert('Запис на цей день вже існує');
      } else {
        alert('Помилка збереження. Спробуйте ще раз.');
      }
    },
  });

  const handleEditEntry = (_entry: TimeLogEntry) => {
    // TODO: Open Edit BottomSheet (planned per Figma annotation §12 Q3)
    console.log('[W2.1] Edit entry requested:', _entry.id);
  };

  return (
    <div
      style={{
        background: '#222226',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── Fixed Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 16,
          height: 68,
          flexShrink: 0,
        }}
      >
        {/* Title: "Додати облік • №000445" — Inter SemiBold 17px */}
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: '20.4px',
            letterSpacing: '-0.43px',
            color: '#ededed',
            margin: 0,
          }}
        >
          Додати облік • №{orderNumber}
        </h1>

        {/* Close button: circular, bg #2d2d31, border #3e3e42 */}
        <button
          onClick={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#2d2d31',
            border: '1px solid #3e3e42',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            color: '#ededed',
            lineHeight: 1,
          }}
          aria-label="Закрити"
        >
          ✕
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          paddingInline: 16,
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
        }}
      >
        {/* Form card */}
        <TimeFormCard
          hook={formHook}
          isPerUnit={isPerUnit}
          unitLabel={unitLabel}
          onSave={() => handleSave()}
          isSaving={isSaving}
        />

        {/* Records section: header + "Записи за [date]" + entry cards or empty state */}
        <TimeEntriesSection
          date={form.logDate}
          entries={entries}
          onEdit={handleEditEntry}
        />
      </div>
    </div>
  );
}
