// src/types/leave.types.ts
// Traces to: TECH_STACK §TypeScript Interfaces, SCREEN_Profile/TimeOff/LeaveForm scenarios

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveType {
  id: string;
  label_uk: string;
  label_en: string;
}

export interface LeaveRequest {
  id: string;
  type: string;         // Display label e.g. "Лікарняний"
  startDate: string;    // "YYYY-MM-DD"
  endDate: string;      // "YYYY-MM-DD"
  durationDays: number;
  reason?: string;
  status: LeaveStatus;
}

export interface CalendarDot {
  date: string;         // "YYYY-MM-DD"
  status: LeaveStatus;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  company: { name: string };
}

export interface UserPreferences {
  language: 'uk' | 'en';
  theme: 'dark' | 'light';
}
