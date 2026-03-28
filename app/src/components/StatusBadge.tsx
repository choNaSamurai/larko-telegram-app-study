import type { OrderStatus } from '../types';
import { cn } from '../utils/cn';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; colorClass: string; dotClass: string }> = {
  new: {
    label: 'Новий',
    colorClass: 'bg-status-info/10 text-status-info',
    dotClass: 'bg-status-info',
  },
  in_progress: {
    label: 'В процесі',
    colorClass: 'bg-status-warning/10 text-status-warning',
    dotClass: 'bg-status-warning',
  },
  completed: {
    label: '✓ Готово',
    colorClass: 'bg-status-success/10 text-status-success',
    dotClass: 'bg-status-success',
  },
  blocked: {
    label: 'Заблоковано',
    colorClass: 'bg-status-error/10 text-status-error',
    dotClass: 'bg-status-error',
  },
  checking: {
    label: 'Перевіряється',
    colorClass: 'bg-status-info/10 text-status-info',
    dotClass: 'bg-status-info',
  },
  dispute: {
    label: 'Диспут',
    colorClass: 'bg-status-pending/10 text-status-pending',
    dotClass: 'bg-status-pending',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;
  
  return (
    <div className={cn(
      "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium transition-colors",
      config.colorClass,
      className
    )}>
      {status !== 'completed' && <div className={cn("size-1.5 rounded-full", config.dotClass)} />}
      <span>{config.label}</span>
    </div>
  );
}
