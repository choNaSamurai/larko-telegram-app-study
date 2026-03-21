import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { User, ChevronRight, Search, UserPlus, Copy, Check } from 'lucide-react';

export const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ fullName: '', id: crypto.randomUUID() });
  const [copied, setCopied] = useState(false);

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

      </div>

      <div className="pt-8">
        {!showInvite ? (
          <button 
            onClick={() => setShowInvite(true)}
            className="w-full h-16 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-default)] rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:bg-[var(--accent-glow)] transition-all active:scale-95"
          >
            <UserPlus size={18} />
            INVITE NEW SPECIALIST
          </button>
        ) : (
          <div className="premium-card bg-[var(--bg-secondary)] border-[var(--accent-primary)]/20 shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-300">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-tighter text-lg mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)]">
                <UserPlus size={16} strokeWidth={3} />
              </div>
              DRAFT INVITATION
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">FULL NAME IDENTITY</label>
                <input 
                  type="text" 
                  placeholder="e.g. IVAN PETROV"
                  value={inviteData.fullName}
                  onChange={(e) => setInviteData({...inviteData, fullName: e.target.value})}
                  className="w-full h-12 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl px-4 font-black text-xs uppercase tracking-widest text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] outline-none transition-all"
                />
              </div>

              {inviteData.fullName && (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] space-y-2">
                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">INVITATION TARGET URL</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-mono font-bold text-[var(--accent-primary)] flex-1 truncate opacity-60">
                        t.me/WorkTrackerBot/app?startapp=invite_worker_{inviteData.id}
                      </code>
                      <button 
                        onClick={() => {
                          const link = `https://t.me/WorkTrackerBot/app?startapp=invite_worker_${inviteData.id}`;
                          navigator.clipboard.writeText(link);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          dataService.registerWorker({ id: inviteData.id, full_name: inviteData.fullName });
                        }}
                        className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all"
                      >
                        {copied ? <Check size={18} className="text-[var(--status-success)]" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowInvite(false);
                      setInviteData({ fullName: '', id: crypto.randomUUID() });
                    }}
                    className="w-full h-12 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    FINALIZE & CLOSE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
