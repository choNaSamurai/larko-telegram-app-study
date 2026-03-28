import { useState } from 'react';
import { W1MyTasks } from './pages/W1MyTasks';
import { W3MyBalanceScreen } from './pages/W3MyBalance';

type ActiveTab = 'tasks' | 'balance' | 'profile';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');

  return (
    <div className="max-w-[420px] mx-auto min-h-screen border-x border-white/5 shadow-2xl overflow-hidden relative">
      {/* Screen Content */}
      <div className="relative">
        {activeTab === 'tasks' && (
          <W1MyTasks />
        )}
        {activeTab === 'balance' && (
          <W3MyBalanceScreen
            onNavigateToTasks={() => setActiveTab('tasks')}
          />
        )}
        {activeTab === 'profile' && (
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <p className="text-content-secondary text-sm">Профіль — в розробці</p>
          </div>
        )}
      </div>

      {/* Background Gradient Orbs for Visual Premium Feel */}
      <div className="fixed top-[-100px] left-[-100px] size-[300px] bg-status-info/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[100px] right-[-100px] size-[300px] bg-status-warning/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Global Bottom Navigation Bar — Figma node 113:10090 */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[358px] h-16 bg-bg-card/90 backdrop-blur-xl rounded-full border border-white/8 flex items-center justify-around px-6 z-[100] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        aria-label="Навігація"
      >
        {/* Tasks Tab */}
        <button
          id="nav-tasks-btn"
          onClick={() => setActiveTab('tasks')}
          aria-label="Мої завдання"
          aria-current={activeTab === 'tasks' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'tasks' ? 'text-bg-primary' : 'text-content-secondary'
          }`}
        >
          {activeTab === 'tasks' ? (
            <div className="px-4 py-1.5 rounded-full bg-white">
              <span className="text-[10px] font-bold text-bg-primary">Tasks</span>
            </div>
          ) : (
            <span className="text-[10px] font-medium">Tasks</span>
          )}
        </button>

        {/* Balance Tab — center, active = white pill */}
        <button
          id="nav-balance-btn"
          onClick={() => setActiveTab('balance')}
          aria-label="Мій баланс"
          aria-current={activeTab === 'balance' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'balance' ? 'text-bg-primary' : 'text-content-secondary'
          }`}
        >
          {activeTab === 'balance' ? (
            <div className="px-4 py-1.5 rounded-full bg-white">
              <span className="text-[10px] font-bold text-bg-primary">Balance</span>
            </div>
          ) : (
            <span className="text-[10px] font-medium">Balance</span>
          )}
        </button>

        {/* Profile Tab */}
        <button
          id="nav-profile-btn"
          onClick={() => setActiveTab('profile')}
          aria-label="Профіль"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'profile' ? 'text-bg-primary' : 'text-content-secondary'
          }`}
        >
          {activeTab === 'profile' ? (
            <div className="px-4 py-1.5 rounded-full bg-white">
              <span className="text-[10px] font-bold text-bg-primary">Profile</span>
            </div>
          ) : (
            <span className="text-[10px] font-medium">Profile</span>
          )}
        </button>
      </nav>
    </div>
  );
}

export default App;
