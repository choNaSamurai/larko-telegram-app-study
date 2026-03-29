// src/components/screens/Profile/ProfileHeader.tsx
// Traces to: Scenario §4 Step 4, §12.1, Figma node 73:54178

import { Icon } from '@iconify/react';
import type { UserProfile } from '@/types/leave.types';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex flex-col items-center px-5"
      style={{ paddingTop: 40, paddingBottom: 24 }}
    >
      {/* Avatar — 80×80px, rounded-full, border rgba(255,255,255,0.25) */}
      <div
        className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.25)' }}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: '#3e3e42' }}
          >
            <span className="text-xl font-bold text-[#ededed]">{initials}</span>
          </div>
        )}
      </div>

      {/* Full name — 20px bold, tracking -0.5px */}
      <h1
        className="mt-3 font-bold text-[#ededed] text-center"
        style={{ fontSize: 20, lineHeight: '28px', letterSpacing: '-0.5px' }}
      >
        {profile.name}
      </h1>

      {/* Company — icon + name + chevron, pt-4px */}
      <div className="flex items-center gap-2 mt-1">
        {/* Company icon container 16×16px */}
        <div
          className="flex items-center justify-center rounded-[12px] shrink-0"
          style={{
            width: 16, height: 16,
            background: '#141415',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: 1,
          }}
        >
          <Icon icon="mdi:office-building" width={10} color="#ededed" />
        </div>
        {/* Company name — 14px medium white */}
        <span className="text-white font-medium" style={{ fontSize: 14, lineHeight: '20px' }}>
          {profile.company.name}
        </span>
        {/* Dropdown chevron */}
        <Icon icon="solar:alt-arrow-down-bold" width={12} color="#9d9d9d" />
      </div>
    </div>
  );
}
