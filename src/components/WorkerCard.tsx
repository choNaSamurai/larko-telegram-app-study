import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { ArrowLeft, History, PlusCircle } from 'lucide-react';

export const WorkerCard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);

  useEffect(() => {
    const loadWorker = async () => {
      const { data } = await dataService.getWorkers();
      const found = data?.find(w => w.id === id);
      setWorker(found);
    };
    loadWorker();
  }, [id]);

  const handleIssueAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Issued advance of ${advanceAmount} to worker ${id}`);
    setShowAdvancePopup(false);
    setAdvanceAmount('');
    // In real app, call dataService.issueAdvance
  };

  if (!worker) return <div className="p-8 text-center text-slate-400">Worker not found</div>;

  return (
    <div className="space-y-6 text-left">
      <button onClick={() => navigate('/admin/workers')} className="flex items-center gap-2 text-slate-400 mb-2">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Team</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 text-3xl font-bold">
          {worker.full_name.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{worker.full_name}</h2>
        <p className="text-sm text-slate-400 font-medium mb-4">Worker ID: {worker.id}</p>
        
        <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-slate-50">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rate</span>
            <p className="font-bold text-slate-800">{worker.hourly_rate} UAH/h</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Orders</span>
            <p className="font-bold text-slate-800">{worker.active_orders}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={() => setShowAdvancePopup(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
        >
          <PlusCircle size={20} /> Issue Advance
        </button>
      </div>

      {/* History */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <History size={18} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Recent Activity</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-3 text-slate-500">20.03.26</td>
                <td className="px-4 py-3 font-medium text-slate-700 underline underline-offset-2">#1024 Log</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">+1,200</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-500">18.03.26</td>
                <td className="px-4 py-3 font-medium text-slate-700">Advance</td>
                <td className="px-4 py-3 text-right font-bold text-red-500">-2,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Advance Popup */}
      {showAdvancePopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Issue Advance</h3>
            <form onSubmit={handleIssueAdvance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Amount (UAH)</label>
                <input 
                  type="number" 
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="Enter amount..."
                  autoFocus
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-3xl text-indigo-600 outline-none placeholder:text-slate-200"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAdvancePopup(false)}
                  className="flex-1 bg-slate-100 text-slate-500 p-4 rounded-2xl font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-indigo-100"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
