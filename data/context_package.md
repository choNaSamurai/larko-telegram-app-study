# Context Package — WorkTracker MVP

## Project Overview
- **Name**: WorkTracker
- **Goal**: Manufacturing workshop order management and time-tracking system via Telegram Mini App.
- **Client**: ~10-person team, moving from Excel/paper.
- **Platform**: Telegram Mini App (TMA).
- **Backend/DB**: Supabase.
- **Frontend**: React + Vite + TypeScript (per workflow).

## User Roles
1. **Admin**: Managing orders, workers, finance, and settings.
2. **Worker**: Viewing assigned orders, logging time, viewing balance.

## Key Features (MVP + Recommendations)
- **Order Management**: Creation (Admin), Assignment, Status updates (New -> In Progress -> Done).
- **Time Tracking**: Daily logs (Worker: start/end/breaks), automatic net hours calculation.
- **Finance**: Budget summary (Earned / Advances / Remaining), issuing advances (Admin).
- **Notifications**: Telegram-based alerts for new orders, advances, and deadlines.
- **[NEW] Security**: Telegram `initData` validation ( HMAC-SHA256) [Target: Phase 2/Backend Transition].
- **[NEW] UX/UI**: Telegram-native Haptic Feedback and Main Button integration.
- **[NEW] Data Stability**: Error boundaries and Caching layer implementation.

## Technology Specifics
- **Current Storage**: `localStorage` (used instead of Supabase during dev/test).
- **Target Backend**: Supabase (transition planned for next phases).
- **Auth**: Currently based on unverified `telegram_id`; target is HMAC-SHA256 verified `initData`.
- **State**: Client-side async simulation in `dataService.ts`.
- **Localization**: Kyiv timezone.
