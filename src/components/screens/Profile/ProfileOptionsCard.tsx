// src/components/screens/Profile/ProfileOptionsCard.tsx
// Traces to: Scenario §4 Step 5, §12.1, Figma node 73:54196
// CRITICAL: Card bg #2d2d31, border rgba(255,255,255,0.08), rounded-20px
// Row separators: border-b rgba(255,255,255,0.05)
// Icon containers: 32×32px rounded-full bg rgba(255,255,255,0.15)

import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

interface NavRowProps {
  iconId: string;
  label: string;
  onClick?: () => void;
  rightContent?: ReactNode;
  hasSeparator?: boolean;
}

function NavRow({ iconId, label, onClick, rightContent, hasSeparator = true }: NavRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between${hasSeparator ? '' : ''}`}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 16,
        paddingBottom: 17,
        borderBottom: hasSeparator ? '1px solid rgba(255,255,255,0.05)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Left: icon + label */}
      <div className="flex items-center" style={{ gap: 12 }}>
        {/* Icon container: 32×32px rounded-full bg rgba(255,255,255,0.15) */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32,
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.15)',
          }}
        >
          <Icon icon={iconId} width={16} style={{ color: '#ededed' }} />
        </div>
        {/* Label: 14px semibold #ededed */}
        <span
          style={{
            fontSize: 14, fontWeight: 600,
            lineHeight: '20px', color: '#ededed',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>

      {/* Right: custom content or chevron */}
      {rightContent ?? (
        <Icon icon="solar:alt-arrow-right-bold" width={18} style={{ color: '#878787' }} />
      )}
    </div>
  );
}

interface ProfileOptionsCardProps {
  onTimeOff: () => void;
  onSupport: () => void;
}

export function ProfileOptionsCard({ onTimeOff, onSupport }: ProfileOptionsCardProps) {
  return (
    // Card container: bg #2d2d31, border rgba(255,255,255,0.08), rounded-20px, overflow-clip, p-1px
    <div
      className="overflow-hidden"
      style={{
        background: '#2d2d31',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 1, // p-px
      }}
    >
      {/* Row 1: Time Off — with border-b separator */}
      <NavRow
        iconId="solar:calendar-bold"
        label="Вихідні та відпустки"
        onClick={onTimeOff}
        hasSeparator
      />

      {/* Row 2: Language — right side toggle (border-b rgba(255,255,255,0.08)) */}
      {/* Note: Language row uses slightly different separator color per Figma */}
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <NavRow
          iconId="heroicons:globe-alt"
          label="Мова"
          rightContent={<LanguageToggle />}
          hasSeparator={false}
        />
      </div>

      {/* Row 3: Theme — right side toggle (border-b rgba(255,255,255,0.08)) */}
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <NavRow
          iconId="material-symbols:style-outline"
          label="Тема"
          rightContent={<ThemeToggle />}
          hasSeparator={false}
        />
      </div>

      {/* Row 4: Support — no bottom separator */}
      <NavRow
        iconId="solar:question-circle-bold"
        label="Підтримка та FAQ"
        onClick={onSupport}
        hasSeparator={false}
      />
    </div>
  );
}
