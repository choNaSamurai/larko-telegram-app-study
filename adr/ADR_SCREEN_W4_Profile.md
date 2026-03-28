# ADR-W4: Larko Profile & Preferences Architecture
**Status**: [ACCEPTED]

## Context
The Profile screen (W4) serves as the personal settings hub for the Worker role in the Larko Telegram Mini App (TMA). It handles global user preferences including interface language (UK/EN) and theme (Dark/Light). It also displays the authenticated user's high-level profile data.

- **Project Scope**: Worker Preference Management and Profile Display.
- **TMA Constraints**: TMA environment requires near-instant theme toggles without full page reloads, and offline availability. Language changes must apply globally to the UI instantly.

## Problem
1. **Global Preference State Management**: How to instantly propagate language and theme changes across the application without page reloads, persisting them globally while syncing with the backend?
2. **Blocking Context Resolutions**:
   - *OQ-W4-03 (Dynamic i18n reload)*: We assume dynamic JSON-based client-side i18n switching (`react-i18next`) to avoid TMA reload flashes.
   - *OQ-W4-04 (Support & FAQ)*: We assume it opens an external URL using the Telegram WebApp `openLink` API for MVP, avoiding extra screen implementation.

## Options Considered

### Option 1: Context API + LocalStorage for Preferences
- **Pros**: Built-in to React, no extra packages.
- **Cons**: Can trigger unnecessary re-renders across the entire component tree and lacks a built-in sync mechanism to the backend.

### Option 2: Zustand (for local/global state) + TanStack Query (for API sync)
- **Pros**: Highly performant, precise re-renders, easily syncs to localStorage for offline mode, clean separation of server state (profile data) and client state (theme/language).
- **Cons**: Slight overhead of adding Zustand, though it's likely already in the stack.

## Decision
We select **Option 2 (Zustand + TanStack Query)** and `react-i18next` for localization.

## Rationale
- **MVP Speed & UX**: Zustand allows instant UI updates (theme/language) by instantly updating the local persistent store (localStorage), while triggering an asynchronous PATCH to the backend.
- **TMA Performance**: Avoiding full app reloads on language change is critical for the "native" feel of a TMA.
- **TanStack Query Cache Policies**: 
  - Profile data (`/auth/me`) rarely changes. 
  - `staleTime: 5 minutes`
  - `gcTime: 30 minutes`
  - Fallback: Local offline cache via `persistQueryClient`.

## Consequences
- **Positive**: Extremely fast, native-feeling toggles. Full offline support for the profile screen using cached data.
- **Negative**: Adds state sync complexity where the local Zustand store must handle optimistic updates before the PATCH API call completes.

## Future Considerations
- Integrate Telegram's native system theme detection as the default preference for new users instead of defaulting statically to Light.
