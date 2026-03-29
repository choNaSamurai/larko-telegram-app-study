// src/App.tsx
// Global layout root — tab router + sub-screen navigation
// CONSTRAINT: Bottom nav tab switching and sub-screen navigation happen HERE
// Sub-screens (W5, W6) use a stack pushed from Profile (W4)

import { useState } from 'react';
import { MyTasksScreen } from '@/components/screens/MyTasks/MyTasksScreen';
import { MyBalanceScreen } from '@/components/screens/MyBalance/MyBalanceScreen';
import { ProfileScreen } from '@/components/screens/Profile/ProfileScreen';
import { TimeOffScreen } from '@/components/screens/TimeOff/TimeOffScreen';
import { LeaveFormScreen } from '@/components/screens/LeaveForm/LeaveFormScreen';
import type { BottomNavTab } from '@/components/BottomNav';

// Sub-screen stack within the Profile section
type ProfileSubScreen = 'profile' | 'time-off' | 'leave-form' | 'support';

export function App() {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('tasks');
  const [profileSubScreen, setProfileSubScreen] = useState<ProfileSubScreen>('profile');

  const handleTabChange = (tab: BottomNavTab) => {
    // When returning to profile tab, always reset to profile root
    if (tab === 'profile') setProfileSubScreen('profile');
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

  return (
    <>
      {/* ── W1: My Tasks ── */}
      {activeTab === 'tasks' && (
        <MyTasksScreen onTabChange={handleTabChange} />
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
