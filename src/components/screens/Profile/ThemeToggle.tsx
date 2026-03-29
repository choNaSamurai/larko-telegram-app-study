// src/components/screens/Profile/ThemeToggle.tsx
// Traces to: Scenario §5.4, §12.1, Figma nodes 119:5274/119:5305/119:5297
// CRITICAL: Uses exact Iconify IDs from Figma data-name attributes:
//   - fluent-mdl2:clear-night  (dark mode chip)
//   - si:clear-day-line        (light mode chip)

import { Icon } from '@iconify/react';
import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';

export function ThemeToggle() {
  const { theme, setTheme } = useUserPreferencesStore();

  return (
    // Container: bg #3e3e42, border rgba(255,255,255,0.08), rounded-16px, w-122px, p-5px
    <div
      className="flex shrink-0"
      style={{
        width: 122,
        background: '#3e3e42',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 5,
      }}
    >
      {(['dark', 'light'] as const).map((t) => {
        const isActive = theme === t;
        return (
          <button
            key={t}
            onClick={() => void setTheme(t)}
            className="flex-1 flex items-center justify-center"
            style={{
              borderRadius: 12,
              paddingTop: 4,
              paddingBottom: 4,
              background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
              boxShadow: isActive ? '0px 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'background 0.15s',
            }}
          >
            {/* Exact Iconify IDs from Figma data-name */}
            <Icon
              icon={t === 'dark' ? 'fluent-mdl2:clear-night' : 'si:clear-day-line'}
              width={16}
              height={16}
              style={{ color: '#ededed' }}
            />
          </button>
        );
      })}
    </div>
  );
}
