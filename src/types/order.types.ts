// src/types/order.types.ts
// Traces to: SCREEN_Order_Hub scenario §7, §8, Tech Stack §TypeScript Interfaces

import type { TaskStatus } from './task.types';

export interface TimeLog {
  id: string;
  date: string;             // ISO date "2026-03-24"
  netHours: number;         // e.g. 5.0
  workStart: string;        // "08:00"
  workEnd: string;          // "17:00"
  breaks: Array<{ start: string; end: string }>;
  isOvertime: boolean;
  overtimeHours?: number;
  unitsCompleted?: number;  // Per-Unit model only
  isReadOnly: boolean;      // true once submitted
}

export interface OrderPhoto {
  id: string;
  url: string;              // Full-size URL
  thumbnailUrl: string;     // 80×80 thumbnail URL
  uploadedAt: string;       // ISO date
  workerName: string;
}

export interface OrderDispute {
  id: string;
  managerName: string;      // e.g. "Іван С."
  description: string;      // Manager's claim text
  createdAt: string;        // "2026-03-24T09:15:00Z"
  status: 'pending' | 'worker_responded' | 'resolved';
}

export interface OrderDetail {
  id: string;
  number: string;           // "000445"
  name: string;             // "Встановлення сонячної станція №4"
  status: TaskStatus;
  deadline: string;         // ISO date
  amount: number;           // 12400
  notes: string;            // Full instruction text
  location: {
    address: string;        // "Київ, вул. Будівельна 12"
    lat?: number;
    lng?: number;
  };
  timeLogs: TimeLog[];
  totalHours: number;       // Sum of all net hours
  photos: OrderPhoto[];
  photosAddedToday: number; // count for 3-photo limit gate
  dispute?: OrderDispute;
  canAddTime: boolean;      // false when status is checking/dispute/done
  canAddPhotos: boolean;    // false when status is done
  canReportIssue: boolean;  // false when status is done
  ctaAction: 'start' | 'complete' | null; // null = no primary CTA
}

export interface DisputeResponsePayload {
  action: 'accept' | 'contest';
  explanation?: string;     // required if action === 'contest'
}
