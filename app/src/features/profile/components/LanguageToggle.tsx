import { usePreferencesStore } from '../../../store/usePreferencesStore';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import clsx from 'clsx';
import { useUpdatePreferencesMutation } from '../../../api/mutations/useUpdatePreferencesMutation';

export const LanguageToggle = () => {
  const { language, setLanguage } = usePreferencesStore();
  const { t } = useTranslation();
  const { mutate } = useUpdatePreferencesMutation();

  const handleToggle = (newLang: 'uk' | 'en') => {
    if (language === newLang) return;
    setLanguage(newLang);
    mutate({ language: newLang });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer px-4">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-content-secondary" />
        <span className="text-content-primary text-base font-medium">{t('profile.language')}</span>
      </div>
      <div className="flex items-center bg-bg-secondary rounded-full p-1 border border-white/5" role="radiogroup" aria-label={t('profile.language')}>
        <button
          type="button"
          role="radio"
          aria-checked={language === 'uk'}
          onClick={() => handleToggle('uk')}
          className={clsx(
            "px-3 py-1 text-sm rounded-full transition-all font-medium",
            language === 'uk' ? "bg-status-info text-white shadow-sm" : "text-content-secondary"
          )}
        >
          UA
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={language === 'en'}
          onClick={() => handleToggle('en')}
          className={clsx(
            "px-3 py-1 text-sm rounded-full transition-all font-medium",
            language === 'en' ? "bg-status-info text-white shadow-sm" : "text-content-secondary"
          )}
        >
          EN
        </button>
      </div>
    </div>
  );
};
