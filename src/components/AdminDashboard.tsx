import React from 'react';
import { Package, Wrench, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'New Order', icon: Package, color: 'bg-blue-500', path: '/admin/orders/new' },
    { label: 'In Progress', icon: Wrench, color: 'bg-yellow-500', path: '/admin/orders', count: 5 },
    { label: 'Team (Workers)', icon: Users, color: 'bg-green-500', path: '/admin/workers', count: 10 },
    { label: 'Finance', icon: Wallet, color: 'bg-purple-500', path: '/admin/finance' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Main Menu</h2>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
          >
            <div className={`p-3 rounded-xl ${item.color} text-white mb-3 shadow-md`}>
              <item.icon size={28} />
            </div>
            <span className="text-sm font-bold text-slate-700">{item.label}</span>
            {item.count !== undefined && (
              <span className="mt-1 text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                {item.count} items
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
