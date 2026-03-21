import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Calendar, Layers } from 'lucide-react';

interface Break {
  id: string;
  start: string;
  end: string;
}

export const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Mock order data
  const order = {
    id: '1',
    name: '#1024 Metal Brackets',
    type: 'Welding',
    qty: 50,
    deadline: '2026-03-25',
    status: 'In Progress'
  };

  const addBreak = () => {
    if (breaks.length < 5) {
      setBreaks([...breaks, { id: crypto.randomUUID(), start: '12:00', end: '13:00' }]);
    }
  };

  const removeBreak = (breakId: string) => {
    setBreaks(breaks.filter(b => b.id !== breakId));
  };

  const calculateNetHours = () => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    breaks.forEach(b => {
      const bStart = new Date(`1970-01-01T${b.start}`);
      const bEnd = new Date(`1970-01-01T${b.end}`);
      diff -= (bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60);
    });

    return Math.max(0, diff).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-8 relative border border-[var(--status-success)]">
          <div className="absolute inset-0 border border-[var(--status-success)] rounded-full animate-ping opacity-20" />
          <CheckCircle size={48} className="text-[var(--status-success)]" />
        </div>
        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tighter uppercase italic">GREAT WORK!</h2>
        <p className="text-[var(--text-secondary)] font-medium mb-10 max-w-[280px] uppercase tracking-widest text-[10px] leading-loose">
          Your hours have been recorded for industrial review. Payouts will update shortly.
        </p>
        <button 
          onClick={() => navigate('/worker')}
          className="btn-premium w-full max-w-[240px] !h-14 uppercase tracking-[0.2em] font-black"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate('/worker')} 
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-2 -ml-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Tasks</span>
      </button>

      {/* Header Info Banner - Obsidian Style */}
      <div className="premium-card bg-[var(--bg-secondary)] border-none !p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent-primary)] opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase line-clamp-2 leading-none">{order.name}</h2>
          <div className="px-3 py-1 bg-[var(--status-warning)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest rounded-md">
            {order.status}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 pt-6 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-default)]">
            <Layers size={14} className="text-[var(--text-secondary)]" />
            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{order.type}</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-default)]">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest font-mono-numbers">{order.qty}</span>
            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">UNIT</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-default)]">
            <Calendar size={14} className="text-[var(--status-error)]" />
            <span className="text-[10px] font-black text-[var(--status-error)] uppercase tracking-widest font-mono-numbers">DUE {order.deadline}</span>
          </div>
        </div>
      </div>

      {/* Time Log Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Clock size={18} className="text-[var(--accent-primary)]" />
            <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Work Interval</h3>
          </div>
          
          <div className="premium-card bg-[var(--bg-secondary)] border-none !p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">START</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-mono-numbers text-lg font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">END</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-mono-numbers text-lg font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none"
                />
              </div>
            </div>

            {/* Breaks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                  BREAKS <span className="text-[var(--accent-primary)] font-mono-numbers">({breaks.length}/5)</span>
                </label>
                <button 
                  type="button" 
                  onClick={addBreak}
                  disabled={breaks.length >= 5}
                  className="h-8 px-4 bg-[var(--accent-primary)] text-[var(--bg-primary)] text-[10px] font-black rounded-lg uppercase tracking-widest active:scale-95 transition-all disabled:opacity-20 flex items-center gap-1.5"
                >
                  <Plus size={14} strokeWidth={3} /> ADD
                </button>
              </div>
              
              <div className="space-y-2">
                {breaks.map((b, index) => (
                  <div key={b.id} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-[var(--bg-tertiary)] rounded-xl px-4 h-12 border border-[var(--border-default)]">
                      <input 
                        type="time" 
                        value={b.start}
                        onChange={(e) => {
                          const newBreaks = [...breaks];
                          newBreaks[index].start = e.target.value;
                          setBreaks(newBreaks);
                        }}
                        className="bg-transparent border-none text-[10px] font-black font-mono-numbers text-[var(--text-primary)] text-center outline-none"
                      />
                      <div className="w-1 h-1 bg-[var(--border-default)] rounded-full" />
                      <input 
                        type="time" 
                        value={b.end}
                        onChange={(e) => {
                          const newBreaks = [...breaks];
                          newBreaks[index].end = e.target.value;
                          setBreaks(newBreaks);
                        }}
                        className="bg-transparent border-none text-[10px] font-black font-mono-numbers text-[var(--text-primary)] text-center outline-none"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeBreak(b.id)}
                      className="w-12 h-12 bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--status-error)] rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-[var(--status-error)] hover:text-[var(--bg-primary)]"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Industrial Summary */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-default)] p-8 rounded-[2rem] flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 group-hover:opacity-[0.02] transition-opacity" />
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Total Net Duration</span>
                <div className="text-4xl font-black font-mono-numbers text-[var(--accent-primary)]">
                  {calculateNetHours()} <span className="text-xs uppercase text-[var(--text-secondary)] font-sans tracking-widest">Hrs</span>
                </div>
              </div>
              <Clock size={40} className="text-[var(--accent-primary)] opacity-20 relative z-10" />
            </div>
          </div>
        </section>

        <button 
          type="submit"
          className="btn-premium w-full !h-16 text-lg uppercase tracking-[0.2em] font-black shadow-[0_0_40px_rgba(212,255,0,0.1)] active:shadow-none transition-shadow"
        >
          Push Records
        </button>
      </form>
    </div>
  );
};
