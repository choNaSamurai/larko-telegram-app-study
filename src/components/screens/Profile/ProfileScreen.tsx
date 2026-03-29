// src/components/screens/Profile/ProfileScreen.tsx
// Traces to: Scenario §4 Main Flow, §8 Screen States, ADR-003-A/B/F
// W4 — Profile root tab screen (bottom nav position 3)

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import type { BottomNavTab } from '@/components/BottomNav';
import { BottomNav } from '@/components/BottomNav';
import { fetchUserProfile } from '@/services/profileService';
import { ProfileHeader } from './ProfileHeader';
import { ProfileOptionsCard } from './ProfileOptionsCard';
import { ProfileSkeleton } from './ProfileSkeleton';

interface ProfileScreenProps {
  onTabChange?: (tab: BottomNavTab) => void;
  onNavigateTo: (screen: 'time-off' | 'support') => void;
}

export function ProfileScreen({ onTabChange, onNavigateTo }: ProfileScreenProps) {
  useEffect(() => {
    WebApp.ready();
    // W4 is a root tab — BackButton must be hidden
    WebApp.BackButton.hide();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div
      className="flex flex-col bg-[#222226]"
      style={{
        height: '100%',
        paddingTop: 'env(safe-area-inset-top, 16px)',
      }}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        {isLoading || !profile ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Header: avatar + name + company */}
            <ProfileHeader profile={profile} />

            {/* Options card — px-16px py-24px */}
            <div style={{ padding: '0 16px 24px' }}>
              <ProfileOptionsCard
                onTimeOff={() => onNavigateTo('time-off')}
                onSupport={() => onNavigateTo('support')}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom navigation — always visible, Profile tab active */}
      <BottomNav activeTab="profile" onTabChange={onTabChange} />
    </div>
  );
}
