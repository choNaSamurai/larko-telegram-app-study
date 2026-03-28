# Tech Stack Specification: SCREEN_W4_Profile

## Overview
Implementation of the Worker Profile settings screen, which acts as the hub for user preferences (Language, Theme) and navigation to Absences. It involves setting up global state toggles with instant UI feedback.

## Core Stack
- **Frontend**: React 18, Vite
- **State Management**: Zustand (local preferences), `react-i18next` (localization)
- **API**: TanStack Query (Server State for `/auth/me`)
- **UI Components**: Tailwind CSS (Dark/Light mode via CSS classes), Radix UI (if bottom sheet switcher is needed)

## File Structure Mapping
- `src/features/profile/screens/ProfileScreen.tsx`
- `src/features/profile/components/OptionsCard.tsx`
- `src/features/profile/components/ThemeToggle.tsx`
- `src/features/profile/components/LanguageToggle.tsx`
- `src/store/usePreferencesStore.ts` (Zustand)
- `src/api/queries/useProfileQuery.ts` (TanStack Query)
- `src/api/mutations/useUpdatePreferencesMutation.ts`

## Step-by-Step Implementation

1. **Phase 1: Setup & State Management**
   - [ ] Implement `usePreferencesStore` (Zustand) with `persist` middleware to save `theme` and `language` in `localStorage`.
   - [ ] Hook Zustand store to the `html` tag class for Tailwind dark mode (`dark` class toggle).
   - [ ] Initialize `react-i18next` reading the language from `usePreferencesStore`.

2. **Phase 2: Data & Logic**
   - [ ] Implement `useProfileQuery` using TanStack Query to fetch `/auth/me`. 
     - Set `staleTime: 1000 * 60 * 5` (5 mins).
   - [ ] Implement `useUpdatePreferencesMutation` to PATCH preferences to the backend in the background when a user toggles theme/language.

3. **Phase 3: Integration & UX**
   - [ ] Build `ProfileScreen.tsx` layout using Tailwind CSS, implementing the Skeleton loading states as defined in the Figma.
   - [ ] Build the `ThemeToggle` and `LanguageToggle` components, ensuring they trigger Zustand state updates instantly (optimistic UI).
   - [ ] Integrate Telegram WebApp `openLink` for the "Support & FAQ" row.

## External Dependencies
- `react-i18next` & `i18next` for translation management.
- `@twa-dev/sdk` for Telegram `openLink` integration.

## Developer Notes
- Use optimistic updates: When the user toggles a theme or language, immediately update the Zustand store and UI before the API PATCH request resolves. If the PATCH fails, silently log the error (user experience shouldn't be interrupted).
