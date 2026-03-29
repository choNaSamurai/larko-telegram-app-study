// src/services/leaveService.ts
// Traces to: TECH_STACK §Service Files (leaveService), ADR-003-A

import { MOCK_LEAVE_REQUESTS, MOCK_LEAVE_TYPES } from './MockData';
import type { LeaveRequest, LeaveType, CalendarDot } from '@/types/leave.types';

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  await new Promise(r => setTimeout(r, 500));
  return [...MOCK_LEAVE_REQUESTS];
  // TODO: fetch('/api/v1/leave-requests', { headers: { Authorization: `Bearer ${token}` } })
}

export async function fetchLeaveCalendar(yearMonth: string): Promise<CalendarDot[]> {
  await new Promise(r => setTimeout(r, 300));
  // Derive calendar dots from mock requests for the given month
  return MOCK_LEAVE_REQUESTS.flatMap(req => {
    const dots: CalendarDot[] = [];
    const start = new Date(req.startDate + 'T00:00:00');
    const end = new Date(req.endDate + 'T00:00:00');
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().split('T')[0];
      if (iso.startsWith(yearMonth)) {
        dots.push({ date: iso, status: req.status });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dots;
  });
  // TODO: fetch(`/api/v1/leave-calendar?month=${yearMonth}`, ...)
}

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_LEAVE_TYPES;
  // TODO: fetch('/api/v1/leave-types', ...)
}

export async function createLeaveRequest(payload: {
  typeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequest> {
  await new Promise(r => setTimeout(r, 700));
  const type = MOCK_LEAVE_TYPES.find(t => t.id === payload.typeId);
  const start = new Date(payload.startDate + 'T00:00:00');
  const end = new Date(payload.endDate + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  // TODO: fetch('/api/v1/leave-requests', { method: 'POST', body: JSON.stringify(payload) })
  return {
    id: `lr-${Date.now()}`,
    type: type?.label_uk ?? payload.typeId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    durationDays: days,
    reason: payload.reason,
    status: 'pending',
  };
}
