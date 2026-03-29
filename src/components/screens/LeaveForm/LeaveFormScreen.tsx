// src/components/screens/LeaveForm/LeaveFormScreen.tsx
// Traces to: Scenario §4 Main Flow, §8 Screen States, Figma node 73:55173, ADR-003-D/F
// W6 — Нова заявка form screen

import { useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';
import { useLeaveFormStore } from '@/stores/useLeaveFormStore';
import { createLeaveRequest, fetchLeaveTypes } from '@/services/leaveService';
import { pluralizeDays } from '@/utils/calendarUtils';

interface LeaveFormScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function LeaveFormScreen({ onBack, onSuccess }: LeaveFormScreenProps) {
  const queryClient = useQueryClient();

  const {
    typeId, startDate, endDate, reason,
    errors, isSubmitting, durationDays, isValid,
    setTypeId, setStartDate, setEndDate, setReason,
    validate, reset, setSubmitting, setSuccess,
  } = useLeaveFormStore();

  // Reset form on mount; handle BackButton
  useEffect(() => {
    reset();
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onBack);
    return () => {
      WebApp.BackButton.offClick(onBack);
      WebApp.BackButton.hide();
    };
  }, [onBack, reset]);

  // Leave types for dropdown
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['leave-types'],
    queryFn: fetchLeaveTypes,
    staleTime: 60 * 60 * 1000,
  });

  // Submit mutation
  const mutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
      setSuccess(true);
      setTimeout(onSuccess, 600);
    },
    onError: () => setSubmitting(false),
  });

  const handleSubmit = useCallback(() => {
    if (!validate() || !typeId || !startDate || !endDate || isSubmitting) return;
    setSubmitting(true);
    mutation.mutate({ typeId, startDate, endDate, reason: reason || undefined });
  }, [validate, typeId, startDate, endDate, reason, isSubmitting, setSubmitting, mutation]);

  const hasErrors = Object.keys(errors).length > 0;
  const today = new Date().toISOString().split('T')[0];

  // Field styling
  const fieldStyle: React.CSSProperties = {
    height: 48,
    background: '#3e3e42',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 17,
    paddingRight: 17,
    paddingTop: 1,
    paddingBottom: 1,
    width: '100%',
  };

  return (
    <div
      className="flex flex-col bg-[#222226]"
      style={{
        height: '100%',
        paddingTop: 'env(safe-area-inset-top, 16px)',
      }}
    >
      {/* Header — 68px */}
      <div
        className="flex items-center shrink-0"
        style={{ height: 68, gap: 12, padding: '0 16px' }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40, height: 40, borderRadius: '9999px',
            background: '#2d2d31', border: '1px solid #3e3e42',
          }}
        >
          <Icon icon="solar:arrow-left-bold" width={18} style={{ color: '#ededed' }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.5px', color: '#ededed' }}>
          Нова заявка
        </span>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        <div
          className="flex flex-col items-center"
          style={{ padding: '0 16px', gap: 16 }}
        >

          {/* ── Field 1: Absence Type ── */}
          <div className="flex flex-col w-full" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: '#878787' }}>
              Тип відсутності
            </label>
            <div style={fieldStyle}>
              <select
                value={typeId ?? ''}
                onChange={e => setTypeId(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  lineHeight: '20px',
                  color: typeId ? '#ededed' : '#525252',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled style={{ color: '#525252' }}>Оберіть тип</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id} style={{ color: '#ededed', background: '#3e3e42' }}>
                    {t.label_uk}
                  </option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-bold" width={16} style={{ color: '#525252', flexShrink: 0 }} />
            </div>
            {errors.typeId && (
              <p style={{ fontSize: 12, lineHeight: '16px', color: '#ef4444' }}>{errors.typeId}</p>
            )}
          </div>

          {/* ── Field 2: Start Date ── */}
          <div className="flex flex-col w-full" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: '#878787' }}>
              Дата початку
            </label>
            <div style={fieldStyle}>
              <input
                type="date"
                value={startDate ?? ''}
                min={today}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, lineHeight: '20px',
                  color: startDate ? '#ededed' : '#525252',
                  colorScheme: 'dark',
                  appearance: 'none', WebkitAppearance: 'none',
                }}
              />
              <Icon icon="solar:calendar-bold" width={16} style={{ color: '#525252', flexShrink: 0 }} />
            </div>
            {errors.startDate && (
              <p style={{ fontSize: 12, lineHeight: '16px', color: '#ef4444' }}>{errors.startDate}</p>
            )}
          </div>

          {/* ── Field 3: End Date ── */}
          <div className="flex flex-col w-full" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: '#878787' }}>
              Дата закінчення
            </label>
            <div style={fieldStyle}>
              <input
                type="date"
                value={endDate ?? ''}
                min={startDate ?? today}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, lineHeight: '20px',
                  color: endDate ? '#ededed' : '#525252',
                  colorScheme: 'dark',
                  appearance: 'none', WebkitAppearance: 'none',
                }}
              />
              <Icon icon="solar:calendar-bold" width={16} style={{ color: '#525252', flexShrink: 0 }} />
            </div>
            {errors.endDate && (
              <p style={{ fontSize: 12, lineHeight: '16px', color: '#ef4444' }}>{errors.endDate}</p>
            )}
          </div>

          {/* ── Duration badge (auto-calculated) ── */}
          {durationDays !== null && (
            <div
              className="w-full flex items-center"
              style={{
                height: 46,
                background: '#3e3e42',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                paddingLeft: 17, paddingRight: 17,
                gap: 12,
              }}
            >
              <Icon icon="solar:info-circle-bold" width={16} style={{ color: '#878787', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#ededed' }}>
                Тривалість: {durationDays} {pluralizeDays(durationDays)}
              </span>
            </div>
          )}

          {/* ── Field 4: Reason (optional) ── */}
          <div className="flex flex-col w-full" style={{ gap: 8, paddingBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px' }}>
              <span style={{ color: '#878787' }}>Причина </span>
              <span style={{ color: '#525252' }}>(необов'язково)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Опишіть причину..."
              style={{
                height: 96,
                background: '#3e3e42',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 13,
                fontSize: 14, lineHeight: '20px',
                color: reason ? '#ededed' : '#525252',
                outline: 'none',
                resize: 'none',
                width: '100%',
              }}
            />
          </div>

          {/* ── Validation error banner ── */}
          {hasErrors && (
            <div
              className="w-full flex items-center"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 16,
                padding: '12px 16px',
                gap: 12,
              }}
            >
              <Icon icon="solar:danger-triangle-bold" width={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#878787' }}>
                Виправте помилки перед надсиланням
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Submit button — fixed at bottom, pt-16px pb-32px */}
      <div
        className="shrink-0"
        style={{ padding: '16px 16px 32px' }}
      >
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 32,
            fontSize: 16, fontWeight: 600, lineHeight: '24px',
            background: isValid ? '#ffffff' : '#f4f4f5',
            color: isValid ? '#222226' : '#878787',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {isSubmitting ? 'Надсилання...' : 'Надіслати заявку'}
        </button>
      </div>
    </div>
  );
}
