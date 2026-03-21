import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Plus, Tag, Trash2, Edit2, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTypes = async () => {
      const { data } = await dataService.getProductTypes();
      if (data) setTypes(data);
      setLoading(false);
    };
    loadTypes();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--primary-glow)] border-t-[var(--primary)] rounded-full animate-spin"></div>
      <span className="text-sm font-medium text-[var(--text-muted)]">Loading settings...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <div className="px-2 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--text)]">Settings</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1">Configure production rates</p>
        </div>
        <button className="w-12 h-12 bg-[var(--primary)] text-white rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center active:scale-95 transition-transform">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-4">
        {types.map((type) => (
          <div 
            key={type.id}
            className="premium-card flex items-center justify-between group hover:border-[var(--primary)]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary-glow)] transition-colors">
                <Tag size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-black text-[var(--text)] text-lg">{type.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider">{type.unit_rate} UAH</span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">per unit</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-glow)] flex items-center justify-center transition-all">
                <Edit2 size={18} strokeWidth={2.5} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card !bg-slate-900 border-none relative overflow-hidden p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Rate Integrity</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              New rates only apply to future orders. Existing active orders will maintain the rates they were created with to ensure financial consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
