import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FilterGroup } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskFilterProps {
  activeGroup: FilterGroup;
  onFilterChange: (group: FilterGroup) => void;
  className?: string;
}

/**
 * Segmented control for filtering tasks.
 * Traces to Scenario §7, Figma [74:4941].
 */
export const TaskFilter: React.FC<TaskFilterProps> = ({
  activeGroup,
  onFilterChange,
  className,
}) => {
  return (
    <div className={cn('bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl flex', className)}>
      <button
        onClick={() => onFilterChange('active')}
        className={cn(
          'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
          activeGroup === 'active'
            ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        )}
      >
        Active
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={cn(
          'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
          activeGroup === 'completed'
            ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        )}
      >
        Completed
      </button>
    </div>
  );
};
