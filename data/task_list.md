# Task List — WorkTracker Execution

## 1. Repository & Scaffolding
- [ ] Initialize Vite project: `npx create-vite@latest . --template react-ts`
- [ ] Install dependencies:
  - `npm install @supabase/supabase-js @telegram-apps/sdk-react lucide-react zustand react-router-dom`
  - `npm install -D vitest @testing-library/react`
- [ ] Configure Tailwind CSS (for modern UI as per rules).
- [ ] Set up project structure (`src/components`, `src/hooks`, etc.).

## 2. Supabase Setup
- [ ] Create Supabase project.
- [ ] Apply SQL migrations (Tables, Enums).
- [ ] Configure RLS policies for `profiles`, `orders`, `time_logs`, and `advances`.
- [ ] Set up Auth with Telegram (Custom auth or using `initData`).

## 3. Telegram Bot Configuration
- [ ] Create Bot via BotFather.
- [ ] Set WebApp URL to local/staging URL.
- [ ] Configure Bot commands (optional).

## 4. Core Feature Implementation
- [x] **Auth Layer**: `useTelegram` hook to extract `initData`.
- [ ] **TMA Native UX**:
  - [ ] Implement `useHaptic` hook for tactile feedback.
  - [ ] Integrate `Telegram.WebApp.MainButton` into `NewOrder` and `TimeLog` forms.
- [ ] **Data Stability & Caching**:
  - [ ] Install and configure `@tanstack/react-query`.
  - [ ] Refactor `dataService` calls to use `useQuery` / `useMutation`.
  - [ ] Implement `ErrorBoundary` component for dashboard sections.

## 5. Backend Logic (Prep & Transition)
- [ ] Implement `validateInitData` utility (pre-migration) to check `initData` structure.
- [ ] Prepare Supabase Edge Function skeleton for validation.

## 6. Polishing & Verification
- [ ] Add micro-animations (Framer Motion).
- [ ] Responsive design check (Mobile first for Telegram).
- [ ] Functional walkthrough of all new features in TMA.
