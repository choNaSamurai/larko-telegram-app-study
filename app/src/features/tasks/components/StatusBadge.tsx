import React from 'react';
import type { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  NEW: { 
    label: 'Нове', 
    className: 'bg-[var(--color-status-new)] text-[var(--color-status-new-text)]' 
  },
  IN_PROGRESS: { 
    label: 'В процесі', 
    className: 'bg-[var(--color-status-progress)] text-[var(--color-status-progress-text)]' 
  },
  IN_REVIEW: { 
    label: 'На перевірці', 
    className: 'bg-[var(--color-status-review)] text-[var(--color-status-review-text)]' 
  },
  DONE: { 
    label: 'Завершено', 
    className: 'bg-[var(--color-status-done)] text-[var(--color-status-done-text)]' 
  },
  BLOCKED: { 
    label: 'Заблоковано', 
    className: 'bg-[var(--color-status-blocked)] text-[var(--color-status-blocked-text)]' 
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};
