// src/App.tsx
// Global layout root — tab router for W1 (Tasks) and W3 (Balance)
// CONSTRAINT: Bottom nav tab switching happens HERE via activeTab state

import { useState } from 'react';
import { MyTasksScreen } from '@/components/screens/MyTasks/MyTasksScreen';
import { MyBalanceScreen } from '@/components/screens/MyBalance/MyBalanceScreen';
import type { BottomNavTab } from '@/components/BottomNav';

export function App() {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('tasks');

  return (
    <>
      {/* Mount/unmount screens on tab change — Zustand stores persist filter state */}
      {activeTab === 'tasks'   && <MyTasksScreen   onTabChange={setActiveTab} />}
      {activeTab === 'balance' && <MyBalanceScreen onGoToTasks={() => setActiveTab('tasks')} />}
      {/* Profile (W4) — to be added when that screen is implemented */}
    </>
  );
}
