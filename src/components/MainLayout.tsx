import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Wallet, Settings, Calendar } from 'lucide-react';

interface LayoutProps {
  role: 'admin' | 'worker';
  children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ role, children }) => {
  const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'HUB' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'ORDERS' },
    { to: '/admin/workers', icon: Users, label: 'TEAM' },
    { to: '/admin/finance', icon: Wallet, label: 'FINANCE' },
    { to: '/admin/settings', icon: Settings, label: 'RULES' },
  ];

  const workerNav = [
    { to: '/worker', icon: Calendar, label: 'TASKS' },
    { to: '/worker/balance', icon: Wallet, label: 'WALLET' },
    { to: '/worker/absences', icon: Calendar, label: 'LEAVE' },
  ];

  const navItems = role === 'admin' ? adminNav : workerNav;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Deep Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-default)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)]">
            <LayoutDashboard size={20} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">LARKO <span className="text-[var(--text-secondary)] font-medium not-italic">MVP</span></h1>
        </div>
        <div className="text-[10px] font-black px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded text-[var(--text-secondary)] uppercase">
          {role}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32">
        {children}
      </main>

      {/* Seamless Harmony Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[2rem] p-2 flex items-center justify-around shadow-2xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/worker'}
              className={({ isActive }) => 
                `relative flex flex-col items-center justify-center h-14 w-14 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? 'text-[var(--accent-primary)] bg-[var(--bg-tertiary)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.icon size={22} strokeWidth={2.5} />
              <span className="text-[8px] font-black mt-1 uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
