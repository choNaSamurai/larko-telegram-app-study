// src/components/screens/Profile/LanguageToggle.tsx
// Traces to: Scenario §5.3, §12.1 Figma nodes 73:54218/73:54219/73:54221

import { useUserPreferencesStore } from '@/stores/useUserPreferencesStore';

export function LanguageToggle() {
  const { language, setLanguage } = useUserPreferencesStore();

  return (
    // Container: bg #3e3e42, border rgba(255,255,255,0.08), rounded-16px, p-5px
    <div
      className="flex shrink-0"
      style={{
        background: '#3e3e42',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 5,
      }}
    >
      {(['uk', 'en'] as const).map((lang) => {
        const isActive = language === lang;
        return (
          <button
            key={lang}
            onClick={() => void setLanguage(lang)}
            className="flex items-center justify-center"
            style={{
              borderRadius: 12,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 4,
              paddingBottom: 4,
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              lineHeight: '16px',
              color: isActive ? '#ededed' : '#9d9d9d',
              background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
              boxShadow: isActive ? '0px 1px 2px rgba(0,0,0,0.05)' : 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {lang === 'uk' ? '🇺🇦 UK' : '🇬🇧 EN'}
          </button>
        );
      })}
    </div>
  );
}
