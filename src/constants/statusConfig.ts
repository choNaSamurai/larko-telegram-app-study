// src/constants/statusConfig.ts
// Authoritative status → visual mapping. Traces to: Scenario §7 + §12.1 Color Table.
// ADR: STATUS_BORDER_COLOR applied as border-left only (NOT all sides).

import type { TaskStatus } from '@/types/task.types';

export const STATUS_BORDER_COLOR: Record<TaskStatus, string> = {
  new:         '#60a5fa',  // --status-info
  in_progress: '#fbbf24',  // --status-warning
  overdue:     '#f87171',  // --status-error
  checking:    '#60a5fa',  // --status-info
  dispute:     '#fdba74',  // --status-pending
  done:        '#34d399',  // --status-success
};

export const STATUS_BADGE_BG: Record<TaskStatus, string> = {
  new:         'rgba(96,165,250,0.12)',
  in_progress: 'rgba(251,191,36,0.12)',
  overdue:     'rgba(248,113,113,0.12)',
  checking:    'rgba(96,165,250,0.12)',
  dispute:     'rgba(253,186,116,0.12)',
  done:        'rgba(52,211,153,0.12)',
};

export const STATUS_BADGE_TEXT_COLOR: Record<TaskStatus, string> = {
  new:         '#60a5fa',
  in_progress: '#fbbf24',
  overdue:     '#f87171',
  checking:    '#60a5fa',
  dispute:     '#fdba74',
  done:        '#34d399',
};

// Ukrainian labels matching Figma text nodes
export const STATUS_BADGE_LABEL: Record<TaskStatus, string> = {
  new:         'Новий',
  in_progress: 'В процесі',
  overdue:     'Прострочено',
  checking:    'Перевіряється',
  dispute:     'Диспут',
  done:        '✓ Готово',
};
