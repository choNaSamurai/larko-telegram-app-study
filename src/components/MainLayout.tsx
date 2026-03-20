import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Users, DollarSign, Settings } from 'lucide-react';

interface LayoutProps {
  role: 'admin' | 'worker';
  children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ role, children }) => {
  const adminNav = [
    { to: '/admin', icon: Home, label: 'Home' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/admin/workers', icon: Users, label: 'Team' },
    { to: '/admin/finance', icon: DollarSign, label: 'Finance' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const workerNav = [
    { to: '/worker', icon: ClipboardList, label: 'My Tasks' },
    { to: '/worker/balance', icon: DollarSign, label: 'Balance' },
  ];

  const navItems = role === 'admin' ? adminNav : workerNav;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">WorkTracker</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full uppercase">
            {role}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-1 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/worker'}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
