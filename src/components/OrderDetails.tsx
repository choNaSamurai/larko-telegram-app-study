import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';

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
    // In a real app, send to Supabase
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Submitted!</h2>
        <p className="text-slate-500 mb-6">Your work hours have been recorded. <br/> Status: Review Pending</p>
        <button 
          onClick={() => navigate('/worker')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
        >
          Back to My Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-24">
      <button onClick={() => navigate('/worker')} className="flex items-center gap-2 text-slate-500 mb-2">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header Info */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold text-slate-800">{order.name}</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full uppercase">
            {order.status}
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          {order.type} • {order.qty} pcs • Due <strong>{order.deadline}</strong>
        </p>
      </div>

      {/* Time Log Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Today's Log</h3>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Work Start</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 font-semibold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Work End</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 font-semibold text-slate-700"
                />
              </div>
            </div>

            {/* Breaks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">Breaks ({breaks.length}/5)</label>
                <button 
                  type="button" 
                  onClick={addBreak}
                  disabled={breaks.length >= 5}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
                >
                  <Plus size={14} /> Add Break
                </button>
              </div>
              
              {breaks.map((b, index) => (
                <div key={b.id} className="flex items-center gap-2 group animate-in slide-in-from-right-4 duration-200">
                  <input 
                    type="time" 
                    value={b.start}
                    onChange={(e) => {
                      const newBreaks = [...breaks];
                      newBreaks[index].start = e.target.value;
                      setBreaks(newBreaks);
                    }}
                    className="flex-1 bg-slate-50 border-none rounded-lg p-2 text-sm font-medium"
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="time" 
                    value={b.end}
                    onChange={(e) => {
                      const newBreaks = [...breaks];
                      newBreaks[index].end = e.target.value;
                      setBreaks(newBreaks);
                    }}
                    className="flex-1 bg-slate-50 border-none rounded-lg p-2 text-sm font-medium"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeBreak(b.id)}
                    className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Net Hours Display */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Net Hours Worked:</span>
              <span className="text-lg font-black text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                {calculateNetHours()}h
              </span>
            </div>
          </div>
        </section>

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
        >
          Submit Workday
        </button>
      </form>
    </div>
  );
};
