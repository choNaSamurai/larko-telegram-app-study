import { useEffect, useState } from 'react';
import { 
  init, 
  backButton, 
  mainButton, 
  viewport, 
  themeParams, 
  miniApp,
  initData
} from '@telegram-apps/sdk-react';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      // Initialize SDK
      init();

      // Check and mount components if available
      if (miniApp.mount.isAvailable()) miniApp.mount();
      if (viewport.mount.isAvailable()) viewport.mount();
      
      // Standard TMA initialization
      miniApp.ready();
      viewport.expand();
      
      const data = initData.user();
      if (data) {
        setUser(data);
      }
      // Always set ready, even if not in Telegram (for dev)
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
      setIsReady(true);
    }
  }, []);

  return {
    isReady,
    user,
    tg: {
      backButton,
      mainButton,
      miniApp,
      viewport,
      themeParams,
      initData
    }
  };
};
