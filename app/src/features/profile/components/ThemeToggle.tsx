import { usePreferencesStore } from '../../../store/usePreferencesStore';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useUpdatePreferencesMutation } from '../../../api/mutations/useUpdatePreferencesMutation';

export const ThemeToggle = () => {
  const { theme, setTheme } = usePreferencesStore();
  const { t } = useTranslation();
  const { mutate } = useUpdatePreferencesMutation();

  const handleToggle = (newTheme: 'light' | 'dark') => {
    if (theme === newTheme) return;
    setTheme(newTheme);
    mutate({ theme: newTheme });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer px-4">
      <div className="flex items-center gap-3">
        <Moon className="w-5 h-5 text-content-secondary" />
        <span className="text-content-primary text-base font-medium">{t('profile.theme')}</span>
      </div>
      <div className="flex items-center bg-bg-secondary rounded-full p-1" role="radiogroup" aria-label={t('profile.theme')}>
        <button
          type="button"
          role="radio"
          aria-checked={theme === 'dark'}
          onClick={() => handleToggle('dark')}
          className={clsx(
            "flex items-center justify-center p-1.5 rounded-full transition-all",
            theme === 'dark' ? "bg-bg-primary shadow-sm" : "text-content-secondary"
          )}
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={theme === 'light'}
          onClick={() => handleToggle('light')}
          className={clsx(
            "flex items-center justify-center p-1.5 rounded-full transition-all",
            theme === 'light' ? "bg-bg-primary shadow-sm" : "text-content-secondary"
          )}
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
