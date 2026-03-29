// src/components/BottomNav.tsx
// Traces to: Scenario §7 Navigation Bottom Bar (110:8377), height 64px
// CONSTRAINT: Bottom nav lives in shared components, NOT inside any screen component

import { Icon } from '@iconify/react';

export type BottomNavTab = 'tasks' | 'balance' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange?: (tab: BottomNavTab) => void;
}

interface NavItem {
  key: BottomNavTab;
  label: string;
  icon: string;
  iconActive: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'tasks',
    label: 'Завдання',
    icon: 'solar:clipboard-list-linear',
    iconActive: 'solar:clipboard-list-bold',
  },
  {
    key: 'balance',
    label: 'Баланс',
    icon: 'solar:wallet-linear',
    iconActive: 'solar:wallet-bold',
  },
  {
    key: 'profile',
    label: 'Профіль',
    icon: 'solar:user-circle-linear',
    iconActive: 'solar:user-circle-bold',
  },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      className="shrink-0 flex items-center bg-bg-card border-t border-[rgba(255,255,255,0.05)]"
      style={{
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onTabChange?.(item.key)}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full transition-opacity hover:opacity-80"
          >
            <Icon
              icon={isActive ? item.iconActive : item.icon}
              width={24}
              height={24}
              className={isActive ? 'text-white' : 'text-text-muted'}
            />
            <span
              className={`text-[10px] font-medium leading-none ${
                isActive ? 'text-white' : 'text-text-muted'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
