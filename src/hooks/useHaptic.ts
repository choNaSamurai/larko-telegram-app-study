import { useTelegram } from './useTelegram';

export const useHaptic = () => {
  const { tg } = useTelegram();
  const haptic = tg.hapticFeedback;

  const impact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (haptic && typeof haptic.impactOccurred === 'function') {
      haptic.impactOccurred(style);
    }
  };

  const notification = (type: 'error' | 'success' | 'warning') => {
    if (haptic && typeof haptic.notificationOccurred === 'function') {
      haptic.notificationOccurred(type);
    }
  };

  const selection = () => {
    if (haptic && typeof haptic.selectionChanged === 'function') {
      haptic.selectionChanged();
    }
  };

  return { impact, notification, selection };
};
