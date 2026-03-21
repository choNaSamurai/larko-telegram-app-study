import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { User, ChevronRight, Search, Users as UsersIcon } from 'lucide-react';

export const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadWorkers = async () => {
      const [workersRes, ordersRes] = await Promise.all([
        dataService.getWorkers(),
        dataService.getOrders()
      ]);
      
      if (workersRes.data && ordersRes.data) {
        const enrichedWorkers = workersRes.data.map((w: any) => ({
          ...w,
          active_orders: ordersRes.data.filter((o: any) => 
            o.assigned_worker_id === w.id && o.status !== 'done'
          ).length
        }));
        setWorkers(enrichedWorkers);
      }
      setLoading(false);
    };
    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Recruiting...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-2 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">TEAM</h2>
          <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Workforce overview</p>
        </div>
        <div className="font-mono-numbers text-2xl font-black text-[var(--accent-primary)] flex items-baseline gap-1">
          {workers.length}
          <span className="text-[10px] text-[var(--text-secondary)] tracking-widest">MEMBERS</span>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="SEARCH SPECIALIST..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-16 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl pl-14 pr-6 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] outline-none transition-all placeholder:text-[var(--text-muted)]"
        />
      </div>

      <div className="space-y-3">
        {filteredWorkers.map((worker) => (
          <button
            key={worker.id}
            onClick={() => navigate(`/admin/workers/${worker.id}`)}
            className="premium-card w-full flex items-center justify-between group active:scale-[0.98] border-none bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors !p-5"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-2xl flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] border border-[var(--border-default)] group-hover:border-[var(--accent-primary)] transition-all">
                <User size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-[var(--text-primary)] uppercase tracking-widest text-sm mb-1 group-hover:text-[var(--accent-primary)] transition-colors">{worker.full_name}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-black text-[var(--accent-primary)] font-mono-numbers">{worker.active_orders}</span>
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Tasks active</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[var(--border-default)]" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-black text-[var(--status-success)] font-mono-numbers">{worker.hourly_rate}</span>
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">UAH/h</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-all">
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </button>
        ))}

        {filteredWorkers.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-[var(--bg-secondary)] rounded-[2rem] border border-dashed border-[var(--border-default)]">
            <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-20 relative">
              <UsersIcon size={40} />
              <div className="absolute inset-0 rounded-full border border-[var(--accent-primary)] animate-pulse opacity-10" />
            </div>
            <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] text-[10px]">
              No results match your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
