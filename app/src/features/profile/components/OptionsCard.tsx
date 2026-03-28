import { useTranslation } from 'react-i18next';
import { CalendarRange, ChevronRight, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export const OptionsCard = () => {
  const { t } = useTranslation();

  const handleSupportClick = () => {
    // Open external Notion/FAQ link
    interface TelegramWindow extends Window {
      Telegram?: {
        WebApp?: {
          openLink(url: string, options?: { try_instant_view?: boolean }): void;
        };
      };
    }
    const telegram = (window as unknown as TelegramWindow).Telegram;
    if (telegram?.WebApp?.openLink) {
      telegram.WebApp.openLink('https://larko.ai/faq', { try_instant_view: true });
    } else {
      window.open('https://larko.ai/faq', '_blank');
    }
  };

  const handleTimeOffClick = () => {
    // Will navigate to W5 Absences in future iterations
    console.log('Navigate to W5 Absences');
  };

  return (
    <div className="bg-bg-card rounded-[20px] mx-4 border border-white/5 overflow-hidden shadow-sm flex flex-col">
      {/* Time Off Row */}
      <div 
        onClick={handleTimeOffClick}
        className="flex items-center justify-between py-3.5 px-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <CalendarRange className="w-5 h-5 text-content-secondary" />
          <span className="text-content-primary text-base font-medium">{t('profile.timeOff')}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-content-tertiary" />
      </div>

      {/* Language row */}
      <LanguageToggle />

      {/* Theme row */}
      <ThemeToggle />

      {/* Support Row */}
      <div 
        onClick={handleSupportClick}
        className="flex items-center justify-between py-3.5 px-4 border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-content-secondary" />
          <span className="text-content-primary text-base font-medium">{t('profile.support')}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-content-tertiary" />
      </div>
    </div>
  );
};
