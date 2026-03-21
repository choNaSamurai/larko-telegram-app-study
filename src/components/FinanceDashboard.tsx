import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { PieChart, TrendingUp, Wallet, ArrowDownCircle } from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const { data } = await dataService.getFinanceStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading finance stats...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Finance Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 text-left">
        {/* Main Stats Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <PieChart size={20} />
            </div>
            <span className="font-bold text-slate-800">Overview</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Earned (Wages)</span>
                <div className="text-2xl font-black text-slate-800">{stats?.total_earned?.toLocaleString()} UAH</div>
              </div>
              <TrendingUp size={24} className="text-green-500 mb-1" />
            </div>

            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Advances Issued</span>
                <div className="text-2xl font-black text-slate-800">{stats?.total_advances?.toLocaleString()} UAH</div>
              </div>
              <ArrowDownCircle size={24} className="text-blue-500 mb-1" />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Remaining Payable</span>
                <div className="text-2xl font-black text-indigo-600">{stats?.total_remaining?.toLocaleString()} UAH</div>
              </div>
              <Wallet size={24} className="text-indigo-400 mb-1" />
            </div>
          </div>
        </div>

        {/* Per-Worker Breakdown Label */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight ml-1">Team Summary</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Worker</th>
                <th className="px-4 py-3 text-right">Earned</th>
                <th className="px-4 py-3 text-right">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-4 font-bold text-slate-700">Ivan S.</td>
                <td className="px-4 py-4 text-right text-slate-500">12,400</td>
                <td className="px-4 py-4 text-right font-bold text-indigo-600">4,200</td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-bold text-slate-700">Petro K.</td>
                <td className="px-4 py-4 text-right text-slate-500 ...">15,600</td>
                <td className="px-4 py-4 text-right font-bold text-indigo-600">6,100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
