import React from 'react';
import { MapPin, Building2, Calendar, CreditCard, Info } from 'lucide-react';
import type { Task } from '../types';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  task: Task;
  onTap: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ task, onTap }) => {
  const isUrgent = task.isUrgent || (new Date(task.deadline).getTime() - new Date().getTime()) < 86400000 * 2; // less than 2 days

  return (
    <div 
      onClick={() => onTap(task.id)}
      className="glass rounded-2xl p-4 mb-4 cursor-pointer transition-all active:scale-[0.98] animate-fade-in"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg leading-tight w-[70%] text-slate-900 dark:text-white">
          {task.productType}
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          <Building2 size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">{task.clientName}</span>
        </div>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">{task.address}</span>
        </div>
      </div>

      {task.notesPreview && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 flex items-start border border-slate-100 dark:border-slate-700/50">
          <Info size={14} className="mr-2 mt-0.5 text-slate-400" />
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {task.notesPreview}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-2 rounded-xl border border-white/20 dark:border-white/5">
        <div className="flex gap-4">
          <div className="flex items-center text-xs font-medium">
            <Calendar size={14} className={`mr-1.5 ${isUrgent ? 'text-rose-500' : 'text-slate-400'}`} />
            <span className={isUrgent ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-400'}>
              До {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white">
            <CreditCard size={14} className="mr-1.5 text-slate-400" />
            ₴{task.earnedAmount.toLocaleString()}
          </div>
        </div>
        
        <div className="flex -space-x-2 mr-1">
          {task.workerAvatars.map((src, idx) => (
            <img 
              key={idx} 
              src={src} 
              alt="worker" 
              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
