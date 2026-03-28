import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { usePreferencesStore } from './store/usePreferencesStore';

const resources = {
  en: {
    translation: {
      profile: {
        title: "Profile",
        timeOff: "Time Off & Vacations",
        language: "Language",
        theme: "Theme",
        support: "Support & FAQ",
        inDevelopment: "Profile is under development"
      }
    }
  },
  uk: {
    translation: {
      profile: {
        title: "Профіль",
        timeOff: "Вихідні та відпустки",
        language: "Мова",
        theme: "Тема",
        support: "Підтримка та FAQ",
        inDevelopment: "Профіль — в розробці"
      }
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: usePreferencesStore.getState().language, // Get initial language from store
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false 
    }
  });

// Subscribe to store changes to update language dynamically
usePreferencesStore.subscribe((state, prevState) => {
  if (state.language !== prevState.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
