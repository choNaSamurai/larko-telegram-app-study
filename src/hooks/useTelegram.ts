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

      // Check if we are inside Telegram
      if (miniApp.isMounted()) {
        miniApp.ready();
        viewport.mount();
        viewport.expand();
        
        const data = initData.user();
        if (data) {
          setUser(data);
        }
        setIsReady(true);
      }
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
      // Fallback for development if needed
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
