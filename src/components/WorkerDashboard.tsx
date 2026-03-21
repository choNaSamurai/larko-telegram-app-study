import React from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { ChevronRight, Layers, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useHaptic } from '../hooks/useHaptic';

export const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { impact } = useHaptic();

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => dataService.getOrders().then(res => res.data || [])
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Syncing Tasks...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">TASKS</h2>
          <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Your active feed</p>
        </div>
        <div className="font-mono-numbers text-2xl font-black text-[var(--accent-primary)] flex items-baseline gap-1">
          {orders.length}
          <span className="text-[10px] text-[var(--text-secondary)]">ACTIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <div 
            key={order.id} 
            onClick={() => {
              impact('light');
              navigate(`/worker/orders/${order.id}`);
            }}
            className="premium-card group relative active:scale-[0.98] transition-all cursor-pointer overflow-hidden border-none bg-[var(--bg-secondary)] !p-6"
          >
            {/* Semantic Status Accent */}
            <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-bl-xl ${
              order.status?.toLowerCase() === 'new' 
              ? 'bg-[var(--status-info)] text-[var(--bg-primary)]' 
              : order.status?.toLowerCase() === 'done'
              ? 'bg-[var(--status-success)] text-[var(--bg-primary)]'
              : 'bg-[var(--status-warning)] text-[var(--bg-primary)]'
            }`}>
              {order.status?.replace('_', ' ')}
            </div>

            <div className="mb-6">
              <h3 className="font-black text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 mb-2">
                {order.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="p-1 px-2 rounded-md bg-[var(--bg-tertiary)] flex items-center gap-1.5 border border-[var(--border-default)]">
                  <Layers size={14} className="text-[var(--text-secondary)]" />
                  <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    {order.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-default)] pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">Quantity</span>
                <span className="font-mono-numbers text-xl font-black text-[var(--text-primary)]">{order.quantity} <span className="text-[10px] opacity-40">UNIT</span></span>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">Due Date</span>
                <div className="flex items-center gap-1.5 text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-default)]">
                  <Clock size={12} className="text-[var(--accent-primary)]" />
                  <span className="text-[10px] font-black tracking-tight">{order.deadline}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)]">W1</div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)]">W2</div>
              </div>
              <button className="h-12 px-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] group-hover:border-[var(--accent-primary)] transition-all flex items-center gap-2">
                Open Task <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center bg-[var(--bg-secondary)] rounded-[2rem] border border-dashed border-[var(--border-default)]">
            <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-4xl">рџЋ‰</span>
              <div className="absolute inset-0 rounded-full border border-[var(--accent-primary)] animate-ping opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">REST UP!</h3>
            <p className="text-[var(--text-secondary)] font-medium max-w-[220px] text-xs leading-relaxed uppercase tracking-widest">You have no active orders assigned currently.</p>
          </div>
        )}
      </div>
    </div>
  );
};
