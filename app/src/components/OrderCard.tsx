import { format, isTomorrow, isPast, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Building2, MapPin, Route, FileText, Play, Plus, Check } from 'lucide-react';
import type { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../utils/cn';

interface OrderCardProps {
  order: Order;
  onAction?: (action: string) => void;
}

export function OrderCard({ order, onAction }: OrderCardProps) {
  const deadlineDate = parseISO(order.deadline);
  const isOverdue = isPast(deadlineDate) && !order.status.includes('completed');
  const isSoon = isTomorrow(deadlineDate);
  const showRedDeadline = isOverdue || isSoon || order.isOverdue;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(order.address);
    // In a real TMA we would use a toast notification
    alert('Адресу скопійовано: ' + order.address);
  };

  const statusBorderClass = {
    new: 'border-status-info',
    in_progress: 'border-status-warning',
    completed: 'border-status-success',
    blocked: 'border-status-error',
    checking: 'border-status-info',
    dispute: 'border-status-pending',
  }[order.status] || 'border-status-info';

  return (
    <div className={cn(
      "glass p-4 rounded-[20px] flex flex-col gap-3 border-l-[3px] shadow-card min-w-[340px] w-full max-w-[390px]",
      statusBorderClass
    )}>
      {/* Header Row: Title and Status */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-bold text-content-primary leading-tight flex-1">
          {order.title}
        </h3>
        <StatusBadge status={order.status} />
      </div>

      {/* Info Rows: Company and Address */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-content-tertiary">
          <Building2 size={16} className="shrink-0" />
          <span className="text-[12px] font-medium truncate">{order.companyName}</span>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-content-tertiary flex-1 truncate">
            <MapPin size={16} className="shrink-0" />
            <span className="text-[12px] font-normal truncate">{order.address}</span>
          </div>
          <button 
            onClick={handleCopyAddress}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
            title="Копіювати адресу"
          >
            <Route size={20} className="text-status-info" />
          </button>
        </div>
      </div>

      {/* Notes Block */}
      {order.notes && (
        <div className="bg-bg-input px-3 py-2 rounded-2xl flex gap-2 items-start">
          <FileText size={18} className="text-content-secondary shrink-0 mt-0.5" />
          <p className="text-[11px] font-normal italic text-content-primary leading-[1.4] opacity-90">
            {order.notes}
          </p>
        </div>
      )}

      {/* Footer Row: Deadline, Avatars, Cost */}
      <div className="flex justify-between items-center mt-1">
        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-content-primary">
          <div className="overflow-hidden size-4 relative">
             {/* Calendar Mock Icon */}
             <div className="absolute inset-0 border border-current opacity-40 rounded-sm" />
             <div className="absolute top-0 inset-x-0 h-1 bg-current opacity-60" />
          </div>
          <span className={cn(
            "text-[12px]",
            showRedDeadline ? "text-status-error font-semibold" : "text-content-primary"
          )}>
            До {format(deadlineDate, 'd MMMM', { locale: uk })}
          </span>
        </div>

        {/* Right side: Workers and Cost */}
        <div className="flex items-center gap-3">
          {!!order.assignedWorkersCount && order.assignedWorkersCount > 1 && (
            <div className="flex -space-x-2">
              {[...Array(Math.min(order.assignedWorkersCount as number, 3))].map((_, i) => (
                <div key={i} className="size-5 rounded-full border border-white/20 bg-accent-deep flex items-center justify-center text-[8px] font-bold text-black">
                   {i === 2 && (order.assignedWorkersCount as number) > 3 ? `+${(order.assignedWorkersCount as number) - 2}` : ['П', 'C', 'L'][i]}
                </div>
              ))}
            </div>
          )}
          <div className="text-sm font-bold text-white whitespace-nowrap">
            {order.currency}{order.cost.toLocaleString('uk-UA')}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-1">
        {order.status === 'new' ? (
          <button 
            onClick={() => onAction?.('start')}
            className="flex-1 bg-white text-bg-primary h-8 rounded-full flex items-center justify-center gap-1 text-[13px] font-semibold shadow-button hover:bg-opacity-90 active:scale-95 transition-all"
          >
            <Play size={14} fill="currentColor" />
            Почати роботу
          </button>
        ) : (
          <>
            <button 
              onClick={() => onAction?.('add')}
              className="flex-1 border border-white text-white h-8 rounded-full flex items-center justify-center gap-1 text-[13px] font-semibold hover:bg-white/5 active:scale-95 transition-all"
            >
              <Plus size={14} />
              Додати
            </button>
            <button 
              onClick={() => onAction?.('finish')}
              className="flex-1 bg-white text-bg-primary h-8 rounded-full flex items-center justify-center gap-1 text-[13px] font-semibold shadow-button hover:bg-opacity-90 active:scale-95 transition-all"
            >
              <Check size={14} strokeWidth={3} />
              Завершити
            </button>
          </>
        )}
      </div>
    </div>
  );
}
