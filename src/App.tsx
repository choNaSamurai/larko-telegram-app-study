// src/App.tsx
// Global layout root — tab router + sub-screen navigation
// CONSTRAINT: Bottom nav tab switching and sub-screen navigation happen HERE
// Sub-screens (W5, W6) use a stack pushed from Profile (W4)
// W2 Order Hub: pushed from My Tasks (W1) when a task card is tapped
// W2.1 Add Time Log: pushed from Order Hub when "+ Add Time" is tapped

import { useState } from 'react';
import { MyTasksScreen } from '@/components/screens/MyTasks/MyTasksScreen';
import { MyBalanceScreen } from '@/components/screens/MyBalance/MyBalanceScreen';
import { ProfileScreen } from '@/components/screens/Profile/ProfileScreen';
import { TimeOffScreen } from '@/components/screens/TimeOff/TimeOffScreen';
import { LeaveFormScreen } from '@/components/screens/LeaveForm/LeaveFormScreen';
import { OrderHubScreen } from '@/components/screens/OrderHub/OrderHubScreen';
import { AddTimeLogScreen } from '@/components/screens/AddTimeLog/AddTimeLogScreen';
import type { BottomNavTab } from '@/components/BottomNav';
import type { AddTimeLogContext } from '@/types/timeLog.types';

// Sub-screen stack within the Profile section
type ProfileSubScreen = 'profile' | 'time-off' | 'leave-form' | 'support';

export function App() {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('tasks');
  const [profileSubScreen, setProfileSubScreen] = useState<ProfileSubScreen>('profile');
  // W2 Order Hub navigation: null = not open, string = orderId to show
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // W2.1 Add Time Log: null = not open, context object = screen is open
  const [addTimeContext, setAddTimeContext] = useState<AddTimeLogContext | null>(null);

  const handleTabChange = (tab: BottomNavTab) => {
    // When returning to profile tab, always reset to profile root
    if (tab === 'profile') setProfileSubScreen('profile');
    // Clear order detail when switching tabs
    setSelectedOrderId(null);
    setActiveTab(tab);
  };

  const handleProfileNavigate = (screen: 'time-off' | 'support') => {
    setProfileSubScreen(screen);
  };

  const handleBackToProfile = () => {
    setProfileSubScreen('profile');
  };

  const handleBackToTimeOff = () => {
    setProfileSubScreen('time-off');
  };

  // W2.1: Add Time Log — shown on top of Order Hub stack
  if (addTimeContext) {
    return (
      <AddTimeLogScreen
        context={addTimeContext}
        onBack={() => setAddTimeContext(null)}
        onSaved={() => setAddTimeContext(null)}
      />
    );
  }

  // W2: Order Hub opened — fullscreen overlay
  if (selectedOrderId) {
    return (
      <OrderHubScreen
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
        onOpenAddTime={(ctx) => setAddTimeContext(ctx)}
      />
    );
  }

  return (
    <>
      {/* ── W1: My Tasks ── */}
      {activeTab === 'tasks' && (
        <MyTasksScreen
          onTabChange={handleTabChange}
          onTaskSelect={(taskId) => setSelectedOrderId(taskId)}
        />
      )}

      {/* ── W3: My Balance ── */}
      {activeTab === 'balance' && (
        <MyBalanceScreen onGoToTasks={() => handleTabChange('tasks')} />
      )}

      {/* ── W4/W5/W6: Profile section ── */}
      {activeTab === 'profile' && (
        <>
          {/* W4 — Profile root (always mounted; hidden when sub-screen active) */}
          <div style={{ display: profileSubScreen === 'profile' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <ProfileScreen
              onTabChange={handleTabChange}
              onNavigateTo={handleProfileNavigate}
            />
          </div>

          {/* W5 — Time Off sub-screen */}
          {profileSubScreen === 'time-off' && (
            <TimeOffScreen
              onBack={handleBackToProfile}
              onNewRequest={() => setProfileSubScreen('leave-form')}
            />
          )}

          {/* W6 — Leave Form sub-screen */}
          {profileSubScreen === 'leave-form' && (
            <LeaveFormScreen
              onBack={handleBackToTimeOff}
              onSuccess={handleBackToTimeOff}
            />
          )}
        </>
      )}
    </>
  );
}

