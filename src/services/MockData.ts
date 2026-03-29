// src/services/MockData.ts
// Traces to: Tech Stack §MockData.ts, ADR-001-C, ADR-002, ADR-003
// CONSTRAINT: Mock data lives ONLY here — never in components or hooks

import type { BalanceData } from '@/types/balance.types';
import type { Task } from '@/types/task.types';
import type { UserProfile, LeaveType, LeaveRequest } from '@/types/leave.types';

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
