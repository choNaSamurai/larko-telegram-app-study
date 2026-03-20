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
- [ ] **Auth Layer**: `useTelegram` hook to extract and validate `initData`.
- [ ] **Layout**: Profile header + Bottom navigation.
- [ ] **Admin Dashboard**:
  - `New Order` form.
  - `Orders List` with status filters.
  - `Worker Card` with advance issuance.
- [ ] **Worker Dashboard**:
  - `My Tasks` feed.
  - `Order Details` + `Time Log` submission.
  - `My Balance` summary.

## 5. Backend Logic (Edge Functions)
- [ ] Implement `validate-init-data` function.
- [ ] Implement `send-notification` function for Telegram Bot API.

## 6. Polishing
- [ ] Add micro-animations (Framer Motion).
- [ ] Responsive design check (Mobile first for Telegram).
