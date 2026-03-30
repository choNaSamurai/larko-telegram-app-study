// src/services/MockData.ts
// Traces to: Tech Stack §MockData.ts, ADR-001-C, ADR-002, ADR-003
// CONSTRAINT: Mock data lives ONLY here — never in components or hooks

import type { BalanceData } from '@/types/balance.types';
import type { Task } from '@/types/task.types';
import type { UserProfile, LeaveType, LeaveRequest } from '@/types/leave.types';
import type { OrderDetail } from '@/types/order.types';
import type { TimeLogEntry } from '@/types/timeLog.types';

// Tomorrow's ISO date for deadline highlight testing (Q1 answer)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().split('T')[0];

// Overdue date for E-05/E-06 testing
const overdue = new Date();
overdue.setDate(overdue.getDate() - 3);
const overdueISO = overdue.toISOString().split('T')[0];

export const MOCK_TASKS: Task[] = [
  // Card 1 — New status, fixed price, "▶ Почати роботу" + assignee bubbles
  {
    id: 'task-1',
    name: 'Сонячна Станція №4',
    status: 'new',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: tomorrowISO,
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [
      { id: 'a1', initials: 'П', color: '#34d399' },
      { id: 'a2', initials: 'C', color: '#fbbf24' },
    ],
    hasStartButton: true,
    hasActionButtons: false,
  },

  // Card 4 — In Progress, fixed price, "+ Додати" + "✓ Завершити"
  {
    id: 'task-2',
    name: 'Ремонт електропроводки',
    status: 'in_progress',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-22',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: true,
  },

  // Card 8 — Overdue, fixed price, "+ Додати" + "✓ Завершити"
  {
    id: 'task-3',
    name: 'Ремонт електропроводки',
    status: 'overdue',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: overdueISO,
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: true,
  },

  // Card 9 — Checking/In Review, fixed price, no CTA
  {
    id: 'task-4',
    name: 'Ремонт електропроводки',
    status: 'checking',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-22',
    paymentModel: 'fixed',
    amount: 12400,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },

  // Card 7 — Dispute, per-unit price (₴400/шт), 12 units, no CTA
  {
    id: 'task-5',
    name: 'Підключення лічильника',
    status: 'dispute',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-20',
    paymentModel: 'per_unit',
    amount: 4800,
    amountPerUnit: 400,
    unitLabel: 'шт',
    quantity: 12,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },

  // Card 6 — New, per-unit price, quantity variant
  {
    id: 'task-6',
    name: 'Аудит лічильників',
    status: 'new',
    companyName: 'ТОВ «СонцеДах»',
    address: 'вул. Київська, 5',
    notes: 'Ключі в охоронця при вході. Вхід з воріт ззаду',
    deadline: '2026-03-20',
    paymentModel: 'per_unit',
    amount: 4800,
    amountPerUnit: 400,
    unitLabel: 'шт',
    quantity: 12,
    assignees: [],
    hasStartButton: false,
    hasActionButtons: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// W3 Balance Mock Data
// Traces to: Tech Stack §MockData.ts (balance section), Scenario §8 States S2/S3/S4
// ─────────────────────────────────────────────────────────────────────────────

/** S2 — Default positive state */
export const MOCK_BALANCE_DEFAULT: BalanceData = {
  earned: 18450,
  advances: 5000,
  remaining: 13450,
  periodLabel: 'Березень 2026',
  history: [
    { id: 'h1', type: 'earned',   name: 'Сонячна Станція №4',         date: '23 бер', hours: '9.0 год',       amount:  4050, currency: '₴' },
    { id: 'h2', type: 'advance',  name: 'Аванс',                      date: '22 бер',                         amount: -5000, currency: '₴' },
    { id: 'h3', type: 'earned',   name: 'Ремонт електропроводки',     date: '21 бер', hours: '8.0 год',       amount:  3200, currency: '₴' },
    { id: 'h4', type: 'overtime', name: 'Овертайм · Станція №3',      date: '20 бер', hours: '2.5 год × 1.5', amount:  1688, currency: '₴' },
    { id: 'h5', type: 'earned',   name: 'Аудит лічильників',          date: '19 бер', hours: '8.0 год',       amount:  3600, currency: '₴' },
  ],
};

/** S3 — Negative balance state (advances > earned, BR-W3-03/BR-W3-04) */
export const MOCK_BALANCE_NEGATIVE: BalanceData = {
  earned: 3200,
  advances: 8000,
  remaining: -4800,
  periodLabel: 'Березень 2026',
  history: [
    { id: 'n1', type: 'advance', name: 'Аванс',                  date: '22 бер',                   amount: -5000, currency: '₴' },
    { id: 'n2', type: 'advance', name: 'Аванс',                  date: '18 бер',                   amount: -3000, currency: '₴' },
    { id: 'n3', type: 'earned',  name: 'Ремонт електропроводки', date: '17 бер', hours: '8.0 год', amount:  3200, currency: '₴' },
  ],
};

/** S4 — Empty state (no earnings yet, BR-W3-10) */
export const MOCK_BALANCE_EMPTY: BalanceData = {
  earned: 0,
  advances: 0,
  remaining: 0,
  periodLabel: 'Березень 2026',
  history: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// W4 Profile Mock Data
// Traces to: TECH_STACK_SCREEN_Profile_TimeOff_LeaveForm §MockData.ts
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Павло Мельник',
  avatarUrl: null,
  company: { name: 'Larko.ai Inc' },
};

export const MOCK_LEAVE_TYPES: LeaveType[] = [
  { id: 'vacation',  label_uk: 'Відпустка',              label_en: 'Vacation' },
  { id: 'sick',      label_uk: 'Лікарняний',              label_en: 'Sick Leave' },
  { id: 'personal',  label_uk: 'Особистий день',          label_en: 'Personal Day' },
  { id: 'holiday',   label_uk: 'Вихідний',                label_en: 'Holiday' },
  { id: 'unpaid',    label_uk: 'Неоплачувана відпустка', label_en: 'Unpaid Leave' },
  { id: 'family',    label_uk: 'Сімейна відпустка',      label_en: 'Family Leave' },
  { id: 'training',  label_uk: 'Навчання',                label_en: 'Training' },
  { id: 'other',     label_uk: 'Інше',                    label_en: 'Other' },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1',
    type: 'Лікарняний',
    startDate: '2026-03-10',
    endDate: '2026-03-11',
    durationDays: 2,
    reason: 'Застуда, потрібен відпочинок',
    status: 'pending',
  },
  {
    id: 'lr2',
    type: 'Відпустка',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    durationDays: 3,
    reason: 'Сімейна подорож',
    status: 'approved',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// W2 Order Hub Mock Data — 6 status states
// Traces to: TECH_STACK_SCREEN_Order_Hub §MockData.ts, Scenario §8
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_BASE: Omit<OrderDetail, 'id' | 'status' | 'canAddTime' | 'canAddPhotos' | 'canReportIssue' | 'ctaAction' | 'timeLogs' | 'totalHours' | 'photos' | 'photosAddedToday' | 'dispute'> = {
  number: '000445',
  name: 'Встановлення сонячної станція №4',
  deadline: '2026-03-20',
  amount: 12400,
  notes: 'Потрібно встановити станцію.\nЗнайдеш охоронця при вході взяти ключі. Вхід з центральних воріт.\nКлючі в охоронця при вході. вхід з центральних воріт.',
  location: {
    address: 'Київ, вул. Будівельна 12',
    lat: 50.4501,
    lng: 30.5234,
  },
};

const MOCK_PHOTOS = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=80&h=80&fit=crop',
    uploadedAt: '2026-03-24',
    workerName: 'Worker',
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=80&h=80&fit=crop',
    uploadedAt: '2026-03-24',
    workerName: 'Worker',
  },
];

const MOCK_TIME_LOGS = [
  {
    id: 'tl-1',
    date: '2026-03-24',
    netHours: 5.0,
    workStart: '08:00',
    workEnd: '13:30',
    breaks: [{ start: '10:00', end: '10:30' }],
    isOvertime: false,
    isReadOnly: true,
  },
];

export const MOCK_ORDER_NEW: OrderDetail = {
  ...ORDER_BASE,
  id: 'task-1', // matches MOCK_TASKS id so order can be opened from W1
  status: 'new',
  timeLogs: [],
  totalHours: 0,
  photos: [],
  photosAddedToday: 0,
  canAddTime: true,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: 'start',
};

export const MOCK_ORDER_IN_PROGRESS: OrderDetail = {
  ...ORDER_BASE,
  id: 'task-2',
  status: 'in_progress',
  timeLogs: MOCK_TIME_LOGS,
  totalHours: 5.0,
  photos: MOCK_PHOTOS,
  photosAddedToday: 2,
  canAddTime: true,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: 'complete',
};

export const MOCK_ORDER_OVERDUE: OrderDetail = {
  ...ORDER_BASE,
  id: 'task-3',
  status: 'overdue',
  timeLogs: MOCK_TIME_LOGS,
  totalHours: 5.0,
  photos: MOCK_PHOTOS,
  photosAddedToday: 2,
  canAddTime: true,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: 'complete',
};

export const MOCK_ORDER_CHECKING: OrderDetail = {
  ...ORDER_BASE,
  id: 'task-4',
  status: 'checking',
  timeLogs: MOCK_TIME_LOGS,
  totalHours: 5.0,
  photos: MOCK_PHOTOS,
  photosAddedToday: 2,
  canAddTime: false,
  canAddPhotos: false,
  canReportIssue: false,
  ctaAction: null,
};

export const MOCK_ORDER_DONE: OrderDetail = {
  ...ORDER_BASE,
  id: 'order-done',
  status: 'done',
  timeLogs: MOCK_TIME_LOGS,
  totalHours: 5.0,
  photos: MOCK_PHOTOS,
  photosAddedToday: 0,
  canAddTime: false,
  canAddPhotos: false,
  canReportIssue: false,
  ctaAction: null,
};

export const MOCK_ORDER_DISPUTE: OrderDetail = {
  ...ORDER_BASE,
  id: 'task-5',
  status: 'dispute',
  timeLogs: MOCK_TIME_LOGS,
  totalHours: 5.0,
  photos: MOCK_PHOTOS,
  photosAddedToday: 0,
  dispute: {
    id: 'dispute-1',
    managerName: 'Іван С.',
    description:
      'Іван С. вважає, що фактичний час роботи менший від вказаного. Перерва повинна бути 60 хв замість 30 хв.',
    createdAt: '2026-03-24T09:15:00Z',
    status: 'pending',
  },
  canAddTime: false,
  canAddPhotos: true,
  canReportIssue: true,
  ctaAction: null,
};

// Map by task id for service lookup
export const MOCK_ORDER_MAP: Record<string, OrderDetail> = {
  'task-1': MOCK_ORDER_NEW,
  'task-2': MOCK_ORDER_IN_PROGRESS,
  'task-3': MOCK_ORDER_OVERDUE,
  'task-4': MOCK_ORDER_CHECKING,
  'task-5': MOCK_ORDER_DISPUTE,
  'task-6': MOCK_ORDER_NEW, // same as new for extra card
  'order-done': MOCK_ORDER_DONE,
};

// ─────────────────────────────────────────────────────────────────────────────
// W2.1 Add Time Log Mock Data
// Traces to: Tech Stack §MockData.ts, Scenario §8 States Empty/Populated
// ─────────────────────────────────────────────────────────────────────────────

/** Empty state — no logs for the day yet */
export const MOCK_TIME_LOGS_EMPTY: TimeLogEntry[] = [];

/** Populated state — 4 entries matching Figma "populated" variant */
export const MOCK_TIME_LOGS_POPULATED: TimeLogEntry[] = [
  {
    id: 'tl-001',
    orderId: 'task-1',
    workerId: 'worker-001',
    logDate: new Date().toISOString().split('T')[0],
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [{ id: 'b1', breakStart: '12:00', breakEnd: '13:00' }],
    netHours: 8.0,
    comment: '',
    syncStatus: 'synced',
  },
  {
    id: 'tl-002',
    orderId: 'task-1',
    workerId: 'worker-001',
    logDate: new Date().toISOString().split('T')[0],
    workStart: '18:00',
    workEnd: '20:30',
    breaks: [],
    netHours: 2.5,
    comment: 'Доробляв фасад після дощу',
    syncStatus: 'synced',
  },
  {
    id: 'tl-003',
    orderId: 'task-1',
    workerId: 'worker-001',
    logDate: new Date().toISOString().split('T')[0],
    workStart: '07:00',
    workEnd: '19:30',
    breaks: [
      { id: 'b2', breakStart: '10:00', breakEnd: '10:30' },
      { id: 'b3', breakStart: '13:00', breakEnd: '14:00' },
    ],
    netHours: 11.0,
    comment: 'Перерви: 1.5 год • Важка зміна',
    syncStatus: 'synced',
  },
  {
    id: 'tl-004',
    orderId: 'task-1',
    workerId: 'worker-001',
    logDate: new Date().toISOString().split('T')[0],
    workStart: '09:00',
    workEnd: '12:00',
    breaks: [],
    netHours: 3.0,
    comment: '',
    syncStatus: 'synced',
  },
];

/** Per-Unit variant mock (Variant B from Figma) */
export const MOCK_TIME_LOGS_PER_UNIT: TimeLogEntry[] = [
  {
    id: 'tl-pu-001',
    orderId: 'task-5',
    workerId: 'worker-001',
    logDate: new Date().toISOString().split('T')[0],
    workStart: '08:00',
    workEnd: '17:00',
    breaks: [{ id: 'b4', breakStart: '12:00', breakEnd: '13:00' }],
    netHours: 8.0,
    unitsCompleted: 130,
    syncStatus: 'synced',
  },
];

