import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, Users, BarChart3, Settings } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <PlusCircle size={24} />, label: 'New Order', color: 'bg-indigo-50 text-indigo-600', path: '/admin/orders/new' },
    { icon: <Clock size={24} />, label: 'In Progress', color: 'bg-amber-50 text-amber-600', path: '/admin/orders' },
    { icon: <Users size={24} />, label: 'Team', color: 'bg-blue-50 text-blue-600', path: '/admin/workers', count: 2 },
    { icon: <BarChart3 size={24} />, label: 'Finance', color: 'bg-emerald-50 text-emerald-600', path: '/admin/finance' },
    { icon: <Settings size={24} />, label: 'Catalog', color: 'bg-slate-50 text-slate-600', path: '/admin/settings' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl ${item.color} shadow-sm border border-slate-100/50 active:scale-95 transition-all w-full text-center`}
          >
            <div className="mb-3">{item.icon}</div>
            <span className="font-bold text-sm">{item.label}</span>
            {'count' in item && (
              <span className="mt-1 text-[10px] font-medium px-2 py-0.5 bg-white/50 rounded-full">
                {item.count} items
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
