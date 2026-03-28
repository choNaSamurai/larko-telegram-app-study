import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskStatus } from '../types';

/**
 * Utility for merging tailwind classes.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  NEW: {
    label: 'New',
    bg: 'bg-accent-blue/10 backdrop-blur-xs',
    text: 'text-accent-blue',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-accent-orange/10 backdrop-blur-xs',
    text: 'text-accent-orange',
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: 'bg-zinc-500/10 backdrop-blur-xs',
    text: 'text-zinc-500',
  },
  DONE: {
    label: 'Done',
    bg: 'bg-accent-green/10 backdrop-blur-xs',
    text: 'text-accent-green',
  },
  BLOCKED: {
    label: 'Blocked',
    bg: 'bg-accent-red/10 backdrop-blur-xs',
    text: 'text-accent-red',
  },
};

/**
 * High-fidelity StatusBadge component.
 * Traces to Scenario §7, Figma [74:4946].
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
};
