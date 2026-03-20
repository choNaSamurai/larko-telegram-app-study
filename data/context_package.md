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

## Key Features
- **Order Management**: Creation (Admin), Assignment, Status updates (New -> In Progress -> Done).
- **Time Tracking**: Daily logs (Worker: start/end/breaks), automatic net hours calculation.
- **Finance**: Budget summary (Earned / Advances / Remaining), issuing advances (Admin).
- **Notifications**: Telegram-based alerts for new orders, advances, and deadlines.

## Technology Specifics
- **Auth**: Telegram ID-based authentication via Supabase.
- **State**: Real-time status updates (estimated).
- **Localization**: Kyiv timezone.
