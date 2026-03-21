import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { ArrowLeft, History, PlusCircle, User, Activity, X } from 'lucide-react';

export const WorkerCard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    const [workersRes, ordersRes, historyRes] = await Promise.all([
      dataService.getWorkers(),
      dataService.getOrders(),
      dataService.getTransactionHistory(id)
    ]);
    
    const workerData = workersRes.data?.find((w: any) => w.id === id);
    if (workerData && ordersRes.data) {
      const activeCount = ordersRes.data.filter((o: any) => 
        o.assigned_worker_id === id && o.status !== 'done'
      ).length;
      setWorker({ ...workerData, active_orders: activeCount });
    }
    
    if (historyRes.data) {
      setHistory(historyRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleIssueAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !advanceAmount) return;
    
    const { error } = await dataService.issueAdvance({
      worker_id: id,
      amount: parseFloat(advanceAmount),
      description: 'Cash Advance'
    });

    if (!error) {
      setShowAdvancePopup(false);
      setAdvanceAmount('');
      loadData(); // Refresh history and balance
    }
  };

  if (loading || !worker) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Finding Specialist...</span>
    </div>
  );

  return (
    <div className="space-y-8 text-left pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate('/admin/workers')} 
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-2 -ml-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Fleet</span>
      </button>

      {/* Profile Header - Obsidian Style */}
      <div className="premium-card bg-[var(--bg-secondary)] border-none !p-10 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] opacity-20" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-[var(--bg-tertiary)] border-2 border-[var(--border-default)] rounded-[2rem] flex items-center justify-center text-[var(--accent-primary)] rotate-3 shadow-xl">
            <User size={48} strokeWidth={2.5} className="-rotate-3" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--status-success)] rounded-lg flex items-center justify-center text-[var(--bg-primary)] shadow-lg">
            <Activity size={12} strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tighter uppercase italic">{worker.full_name}</h2>
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] mb-10">UNIT: PRODUCTION SPECIALIST</p>
        
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">STATION RATE</span>
            <p className="text-xl font-black text-[var(--text-primary)] font-mono-numbers">
              {worker.hourly_rate} <span className="text-[10px] font-sans opacity-40">UAH/H</span>
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">STATION LOAD</span>
            <p className="text-xl font-black text-[var(--text-primary)] font-mono-numbers">
              {worker.active_orders} <span className="text-[10px] font-sans opacity-40">UNIT</span>
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowAdvancePopup(true)}
        className="btn-premium w-full !h-16 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(212,255,0,0.1)] active:shadow-none transition-all uppercase tracking-[0.2em] font-black italic"
      >
        <PlusCircle size={24} strokeWidth={3} /> 
        <span>Issue Advance</span>
      </button>

      {/* History Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
          <History size={18} className="text-[var(--accent-primary)]" />
          <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Transaction Ledger</h3>
        </div>
        
        <div className="premium-card !p-0 overflow-hidden border-none bg-[var(--bg-secondary)]">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 text-left">TIMESTAMP</th>
                <th className="px-6 py-4 text-left">NARRATIVE</th>
                <th className="px-6 py-4 text-right">IMPACT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] font-mono-numbers uppercase">
                    {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest mb-0.5">{item.narrative}</span>
                      <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{item.subtext}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-5 text-right font-black font-mono-numbers text-sm ${
                    item.type === 'income' ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                  }`}>
                    {item.impact > 0 ? '+' : ''}{item.impact.toLocaleString()}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-[10px] uppercase font-black text-[var(--text-secondary)]">
                    No transactions recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Advance Popup - Industrial Obsidian Overlay */}
      {showAdvancePopup && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-default)] p-4 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-12 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-4">
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">PAYOUT AUTH</h3>
              <button 
                onClick={() => setShowAdvancePopup(false)}
                className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all border border-[var(--border-default)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIssueAdvance} className="space-y-6 mt-4">
              <div className="bg-[var(--bg-tertiary)] p-10 rounded-3xl border border-[var(--border-default)] group focus-within:ring-2 ring-[var(--accent-glow)] transition-all">
                <label className="block text-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-6">ALLOCATE UAH AMOUNT</label>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-black text-[var(--accent-primary)] opacity-40 italic">₴</span>
                  <input 
                    type="number" 
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    required
                    className="w-full bg-transparent border-none text-center font-black text-6xl text-[var(--text-primary)] outline-none placeholder:text-[var(--border-default)] font-mono-numbers"
                  />
                </div>
              </div>

              <div className="flex gap-4 p-2 pb-4">
                <button 
                  type="button" 
                  onClick={() => setShowAdvancePopup(false)}
                  className="flex-1 h-14 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-[var(--border-default)] text-[10px]"
                >
                  ABORT
                </button>
                <button 
                  type="submit" 
                  className="flex-1 h-14 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 shadow-[0_0_30px_rgba(212,255,0,0.15)] transition-all text-[10px]"
                >
                  COMMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
