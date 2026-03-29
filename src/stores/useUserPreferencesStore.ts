// src/stores/useUserPreferencesStore.ts
// Traces to: TECH_STACK §Zustand Stores, ADR-003-B
// CONSTRAINT: Uses persist middleware — survives tab switching + page reload

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@/types/leave.types';
import { patchUserPreferences } from '@/services/profileService';

interface PreferencesState extends UserPreferences {
  setLanguage: (lang: 'uk' | 'en') => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
}

export const useUserPreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      language: 'uk',
      theme: 'dark',

      setLanguage: async (language) => {
        const prev = get().language;
        set({ language }); // Optimistic
        try {
          await patchUserPreferences({ language });
        } catch {
          set({ language: prev }); // Revert on failure
        }
      },

      setTheme: async (theme) => {
        const prev = get().theme;
        set({ theme }); // Optimistic
        document.documentElement.setAttribute('data-theme', theme);
        try {
          await patchUserPreferences({ theme });
        } catch {
          set({ theme: prev });
          document.documentElement.setAttribute('data-theme', prev);
        }
      },
    }),
    {
      name: 'user-preferences',
      onRehydrateStorage: () => (state) => {
        // Apply theme class on rehydration
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
