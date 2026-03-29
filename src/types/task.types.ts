// src/types/task.types.ts
// Traces to: Scenario §7 UI Elements, §8 Screen States, Tech Stack §TypeScript Interfaces

export type TaskStatus =
  | 'new'
  | 'in_progress'
  | 'overdue'
  | 'checking'
  | 'dispute'
  | 'done';

export type PaymentModel = 'fixed' | 'per_unit' | 'per_hour';

export type FilterTab = 'all' | 'new' | 'in_progress' | 'done';

export interface TaskAssignee {
  id: string;
  initials: string;  // e.g. "П", "C"
  color: string;     // bubble bg color hex
}

export interface Task {
  id: string;
  name: string;               // "Сонячна Станція №4"
  status: TaskStatus;
  companyName: string;        // "ТОВ «СонцеДах»"
  address: string;            // "вул. Київська, 5"
  notes?: string;             // Optional instruction text
  deadline: string;           // ISO date "2026-03-25"
  paymentModel: PaymentModel;
  amount: number;             // 12400 raw number
  amountPerUnit?: number;     // 400 if per_unit
  unitLabel?: string;         // "шт" if per_unit
  quantity?: number;          // 12 if per_unit
  assignees: TaskAssignee[];
  hasStartButton: boolean;    // true → shows "▶ Почати роботу"
  hasActionButtons: boolean;  // true → shows "+ Додати" + "✓ Завершити"
}

// Screen state union — driven by deriveScreenState()
// Traces to: Scenario §8 Screen States
export type ScreenState = 'loading' | 'error' | 'empty' | 'populated';
