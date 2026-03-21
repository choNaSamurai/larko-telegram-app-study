import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { dataService } from '../services/dataService';
import { Wallet, TrendingUp, ArrowDownCircle, Shovel as Shield } from 'lucide-react';

export const WorkerBalance: React.FC = () => {
  const { user } = useTelegram();
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBalance = async () => {
      if (user) {
        const { data } = await dataService.getBalance(user.id);
        setBalance(data);
      } else {
        const { data } = await dataService.getBalance(0);
        setBalance(data);
      }
      setLoading(false);
    };
    loadBalance();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Crunching numbers...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-2">
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">WALLET</h2>
        <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Earnings & Payouts</p>
      </div>

      <div className="space-y-4">
        {/* Main Balance Card - Deep Obsidian */}
        <div className="premium-card !p-8 bg-[var(--bg-secondary)] border-[var(--border-default)] !rounded-[2rem] relative overflow-hidden active:scale-[0.98] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)]">
                <Wallet size={14} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Net Remaining</span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-black font-mono-numbers text-[var(--accent-primary)]">
                {balance?.remaining?.toLocaleString()}
              </div>
              <span className="text-sm font-black text-[var(--text-secondary)] uppercase">UAH</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Earned Summary */}
          <div className="premium-card bg-[var(--bg-secondary)] border-none p-5 active:scale-95">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-[var(--status-success)] border border-[var(--border-default)]">
                <TrendingUp size={20} />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">Total Earned</span>
            <div className="text-xl font-black font-mono-numbers text-[var(--text-primary)]">
              {balance?.earned?.toLocaleString()}
            </div>
          </div>

          {/* Advances Summary */}
          <div className="premium-card bg-[var(--bg-secondary)] border-none p-5 active:scale-95">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-[var(--status-info)] border border-[var(--border-default)]">
                <ArrowDownCircle size={20} />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-info)]" />
            </div>
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">Advances</span>
            <div className="text-xl font-black font-mono-numbers text-[var(--text-primary)]">
              {balance?.advances?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Info Banner */}
      <div className="bg-[var(--bg-secondary)] border-l-2 border-[var(--status-warning)] p-6 rounded-r-2xl flex items-start gap-4">
        <Shield size={20} className="text-[var(--status-warning)] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Integrity Notice</h4>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold leading-relaxed uppercase tracking-wider">
            Balance updates on task completion. Physical payouts require admin verification at larko HQ.
          </p>
        </div>
      </div>
    </div>
  );
};
