// src/components/screens/TimeOff/TimeOffScreen.tsx
// Traces to: Scenario §4 Main Flow, §8 Screen States, ADR-003-A/C/F
// W5 — Вихідні та відпустки sub-screen (navigated from W4 Profile)

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { Icon } from '@iconify/react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { fetchLeaveRequests, fetchLeaveCalendar } from '@/services/leaveService';
import { formatMonthLabel } from '@/utils/calendarUtils';
import { MiniCalendar } from './MiniCalendar';
import { RequestCard } from './RequestCard';

interface TimeOffScreenProps {
  onBack: () => void;
  onNewRequest: () => void;
}

export function TimeOffScreen({ onBack, onNewRequest }: TimeOffScreenProps) {
  const { year, month } = useCalendarStore();
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    // W5 is a sub-screen — show TMA BackButton
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onBack);
    return () => {
      WebApp.BackButton.offClick(onBack);
      WebApp.BackButton.hide();
    };
  }, [onBack]);

  const { data: requests = [], isLoading: loadingReqs } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: fetchLeaveRequests,
    staleTime: 2 * 60 * 1000,
  });

  const { data: dots = [] } = useQuery({
    queryKey: ['leave-calendar', yearMonth],
    queryFn: () => fetchLeaveCalendar(yearMonth),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="flex flex-col bg-[#222226]"
      style={{
        height: '100%',
        paddingTop: 'env(safe-area-inset-top, 16px)',
      }}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        {/* ── Header: back button + title — 68px high */}
        <div
          className="flex items-center shrink-0"
          style={{ height: 68, gap: 12, padding: '0 16px' }}
        >
          {/* Back button: 40×40px, bg #2d2d31, border #3e3e42, rounded-full */}
          <button
            onClick={onBack}
            className="flex items-center justify-center shrink-0"
            style={{
              width: 40, height: 40,
              borderRadius: '9999px',
              background: '#2d2d31',
              border: '1px solid #3e3e42',
            }}
          >
            <Icon icon="solar:arrow-left-bold" width={18} style={{ color: '#ededed' }} />
          </button>
          <span
            style={{
              fontSize: 18, fontWeight: 600,
              lineHeight: '28px', letterSpacing: '-0.5px',
              color: '#ededed', whiteSpace: 'nowrap',
            }}
          >
            Вихідні та відпустки
          </span>
        </div>

        {/* ── Month label — px-16px py-8px */}
        <div style={{ padding: '8px 16px' }}>
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#878787' }}>
            {formatMonthLabel(year, month)}
          </p>
        </div>

        {/* ── Mini Calendar — mx-4px (inside), pb-16px */}
        <div style={{ paddingBottom: 16 }}>
          <MiniCalendar dots={dots} />
        </div>

        {/* ── Requests section — px-16px */}
        <div style={{ padding: '0 16px', paddingBottom: 32 }}>
          {/* Section header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#ededed' }}>
              Мої заявки
            </span>
            {/* "+ Нова" button: 80×32px, bg #fafafa, text #222226, rounded-32px */}
            <button
              onClick={onNewRequest}
              className="flex items-center justify-center"
              style={{
                width: 80, height: 32,
                background: '#fafafa',
                borderRadius: 32,
                fontSize: 12, fontWeight: 600, lineHeight: '24px',
                color: '#222226',
                whiteSpace: 'nowrap',
              }}
            >
              + Нова
            </button>
          </div>

          {/* Request cards or loading skeletons */}
          {loadingReqs ? (
            <div className="flex flex-col" style={{ gap: 12 }}>
              {[0, 1].map(i => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ height: 99, background: '#2d2d31', borderRadius: 20 }}
                />
              ))}
            </div>
          ) : requests.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center" style={{ paddingTop: 32, gap: 12 }}>
              <span style={{ fontSize: 48 }}>🏖️</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#ededed', textAlign: 'center' }}>
                Немає заявок на відгул
              </p>
              <p style={{ fontSize: 14, fontWeight: 400, color: '#878787', textAlign: 'center', maxWidth: 240 }}>
                Потрібен вихідний? Створіть заявку нижче 👇
              </p>
              <button
                onClick={onNewRequest}
                style={{
                  width: 224, height: 48,
                  background: '#ffffff',
                  borderRadius: 32,
                  fontSize: 14, fontWeight: 600,
                  color: '#222226',
                  marginTop: 8,
                }}
              >
                + Нова заявка
              </button>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 12 }}>
              {requests.map(req => (
                <RequestCard key={req.id} req={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
