import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Users, PieChart, Settings, Plus, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ orders: 0, workers: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [orders, workers] = await Promise.all([
        dataService.getOrders(),
        dataService.getWorkers()
      ]);
      setCounts({
        orders: orders.data?.length || 0,
        workers: workers.data?.length || 0
      });
    };
    fetchCounts();
  }, []);

  const menuItems = [
    { label: 'Orders', icon: ShoppingBag, path: '/admin/orders', count: counts.orders, color: 'var(--accent-primary)' },
    { label: 'Team', icon: Users, path: '/admin/workers', count: counts.workers, color: 'var(--status-info)' },
    { label: 'Finance', icon: PieChart, path: '/admin/finance', count: null, color: 'var(--status-success)' },
    { label: 'Clients', icon: Users, path: '/admin/clients', count: 0, color: 'var(--text-primary)' },
    { label: 'Rules', icon: Settings, path: '/admin/settings', count: null, color: 'var(--text-secondary)' },
    { label: 'Disputes', icon: AlertCircle, path: '/admin/disputes', count: 0, color: 'var(--status-error)' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-primary)]">DASHBOARD</h2>
          <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Company Status</p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders/new')}
          className="w-12 h-12 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] active:scale-90 transition-all"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="premium-card flex flex-col items-center justify-center gap-4 aspect-square group active:scale-95 border-none bg-[var(--bg-secondary)]"
          >
            <div className="p-4 rounded-[2rem] bg-[var(--bg-tertiary)] transition-all group-hover:bg-[var(--bg-primary)]" style={{ color: item.color }}>
              <item.icon size={32} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.label}</span>
              {item.count !== null && (
                <div className="font-mono-numbers text-xl font-black mt-1 text-[var(--text-primary)]">
                  {item.count}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
