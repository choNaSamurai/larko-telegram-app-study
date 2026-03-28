import React from 'react';
import type { TaskFilterType } from '../types';

interface TaskFilterProps {
  activeFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-4 self-center w-full max-w-sm border border-slate-200 dark:border-slate-700/50">
      <button
        onClick={() => onFilterChange('active')}
        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          activeFilter === 'active'
            ? 'glass text-slate-900 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        Активні
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          activeFilter === 'completed'
            ? 'glass text-slate-900 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        Завершені
      </button>
    </div>
  );
};
