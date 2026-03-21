import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { dataService } from '../services/dataService';
import { Wallet, TrendingUp, ArrowDownCircle } from 'lucide-react';

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
        // Dev fallback
        const { data } = await dataService.getBalance(0);
        setBalance(data);
      }
      setLoading(false);
    };
    loadBalance();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading balance...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">My Balance</h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Total Remaining Card */}
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-sm font-medium opacity-80">Remaining Balance</span>
            <div className="text-4xl font-black mt-1">
              {balance?.remaining?.toLocaleString()} UAH
            </div>
          </div>
          <Wallet className="absolute right-[-10px] bottom-[-10px] text-white/10" size={120} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Earned Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Earned</span>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {balance?.earned?.toLocaleString()}
            </div>
          </div>

          {/* Advances Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
              <ArrowDownCircle size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Advances</span>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {balance?.advances?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          💡 Your balance is updated automatically as orders are completed and advances are issued. Contact the admin for physical payout.
        </p>
      </div>
    </div>
  );
};
