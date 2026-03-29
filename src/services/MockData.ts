// src/services/MockData.ts
// Traces to: Tech Stack §MockData.ts, ADR-001-C
// CONSTRAINT: Mock data lives ONLY here — never in components or hooks

import type { Task } from '@/types/task.types';

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
