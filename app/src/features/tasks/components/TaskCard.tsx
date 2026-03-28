import React from 'react';
import { Box, Calendar, User, ShoppingBag } from 'lucide-react';
import { format, isTomorrow, isBefore, startOfDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from '../types';
import { StatusBadge } from './StatusBadge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: Task;
  onClick: (id: string) => void;
  className?: string;
}

/**
 * High-fidelity Task Card component.
 * Traces to Scenario §7, Figma [74:4946], BRD 2.0.158 (Deadline Highlighting).
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  const isUrgent =
    isTomorrow(new Date(task.deadline)) ||
    isBefore(new Date(task.deadline), startOfDay(new Date()));

  return (
    <div
      onClick={() => onClick(task.id)}
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group',
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {task.orderNumber || 'No Order Number'}
            </span>
            <StatusBadge status={task.status} />
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            {task.serviceType} / {task.productName}
          </span>
        </div>
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-accent-blue/10 transition-colors">
          <ShoppingBag className="w-5 h-5 text-zinc-400 group-hover:text-accent-blue transition-colors" />
        </div>
      </div>

      <div className="space-y-2">
        {task.clientName && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <User className="w-4 h-4 opacity-70" />
            <span>{task.clientName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <Box className="w-4 h-4 opacity-70" />
          <span>Qty: {task.quantity}</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-xs font-semibold',
            isUrgent ? 'text-accent-red' : 'text-zinc-600 dark:text-zinc-400'
          )}
        >
          <Calendar className="w-4 h-4 opacity-70" />
          <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
