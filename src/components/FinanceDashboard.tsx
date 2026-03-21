import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { PieChart, TrendingUp, Wallet, ArrowDownCircle, Users } from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [workerStats, setWorkerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [financeRes, workersRes] = await Promise.all([
        dataService.getFinanceStats(),
        dataService.getWorkers()
      ]);
      
      setStats(financeRes.data);
      
      if (workersRes.data) {
        const individualStats = await Promise.all(
          workersRes.data.map(async (w: any) => {
            const { data } = await dataService.getBalance(w.telegram_id);
            return { ...w, ...data };
          })
        );
        setWorkerStats(individualStats);
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Analyzing Records...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-2">
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">FINANCE</h2>
        <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Company performance</p>
      </div>

      <div className="space-y-6 text-left">
        {/* Main Stats Card - Deep Obsidian */}
        <div className="premium-card !p-8 bg-[var(--bg-secondary)] border-[var(--border-default)] !rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--status-success)] opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-[var(--bg-tertiary)] rounded-xl text-[var(--accent-primary)] border border-[var(--border-default)]">
              <PieChart size={20} />
            </div>
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">P&L Overview</span>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-[var(--border-default)] pb-6 group">
              <div>
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2">Total Wages</span>
                <div className="text-3xl font-black font-mono-numbers text-[var(--text-primary)] group-hover:text-[var(--status-success)] transition-colors">
                  {stats?.total_earned?.toLocaleString()} <span className="text-sm opacity-40">UAH</span>
                </div>
              </div>
              <TrendingUp size={24} className="text-[var(--status-success)] mb-1" />
            </div>

            <div className="flex justify-between items-end border-b border-[var(--border-default)] pb-6 group">
              <div>
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2">Total Advances</span>
                <div className="text-3xl font-black font-mono-numbers text-[var(--text-primary)] group-hover:text-[var(--status-info)] transition-colors">
                  {stats?.total_advances?.toLocaleString()} <span className="text-sm opacity-40">UAH</span>
                </div>
              </div>
              <ArrowDownCircle size={24} className="text-[var(--status-info)] mb-1" />
            </div>

            <div className="flex justify-between items-end group">
              <div>
                <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em] block mb-2">Net Payable</span>
                <div className="text-4xl font-black font-mono-numbers text-[var(--accent-primary)]">
                  {stats?.total_remaining?.toLocaleString()} <span className="text-sm opacity-40 text-[var(--text-primary)]">UAH</span>
                </div>
              </div>
              <Wallet size={32} className="text-[var(--accent-primary)] opacity-20 mb-1" />
            </div>
          </div>
        </div>

        {/* Team Breakdown Header */}
        <div className="flex items-center gap-2 px-2 pt-4">
          <Users size={16} className="text-[var(--text-secondary)]" />
          <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Team Summary</h3>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-default)] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Worker</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Earned</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {workerStats.map((w: any) => (
                <tr key={w.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="px-6 py-5 font-black text-[var(--text-primary)]">{w.full_name}</td>
                  <td className="px-6 py-5 text-right font-mono-numbers text-[var(--text-secondary)]">
                    {w.earned?.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right font-mono-numbers font-black text-[var(--accent-primary)]">
                    {w.remaining?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {workerStats.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-[10px] uppercase font-black text-[var(--text-secondary)]">
                    No worker records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
