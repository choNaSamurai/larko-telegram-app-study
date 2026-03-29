// src/stores/useCalendarStore.ts
// Traces to: TECH_STACK §Zustand Stores, ADR-003-C
// Manages which month is displayed in W5 MiniCalendar — persists across tab switches

import { create } from 'zustand';

interface CalendarState {
  year: number;
  month: number;  // 1-12
  prevMonth: () => void;
  nextMonth: () => void;
}

const now = new Date();

export const useCalendarStore = create<CalendarState>((set, get) => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,

  prevMonth: () => {
    const { year, month } = get();
    if (month === 1) set({ year: year - 1, month: 12 });
    else set({ month: month - 1 });
  },

  nextMonth: () => {
    const { year, month } = get();
    if (month === 12) set({ year: year + 1, month: 1 });
    else set({ month: month + 1 });
  },
}));
