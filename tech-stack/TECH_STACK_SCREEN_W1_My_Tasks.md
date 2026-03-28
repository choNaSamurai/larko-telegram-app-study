# Tech Stack Specification: SCREEN_W1_My_Tasks

## Overview
Technical blueprint for implementing the "My Tasks" vertical feed for workers. Focuses on performance, modularity, and Telegram Mini App integration.

## Core Stack
- **Frontend**: React 18, Vite
- **State Management**: Zustand (Client state), TanStack Query v5 (Server state)
- **Framework Support**: `@telegram-apps/sdk` for TMA integration
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **API**: Axios (with interceptors for auth)

## Step-by-Step Implementation

1.  **Phase 1: Setup & Initialization**
    - [ ] Initialize Vite project with React and TypeScript.
    - [ ] Install `@telegram-apps/sdk`, `@tanstack/react-query`, `zustand`, `axios`, `tailwind-merge`.
    - [ ] Configure `TelegramWebApp` provider and initialization script.
    - [ ] Setup `QueryClient` with a long `staleTime` (e.g., 5 mins) to minimize redundant requests.

2.  **Phase 2: Data Layer & State**
    - [ ] Define `Order` and `Company` TypeScript interfaces based on BRD/Scenario.
    - [ ] Create `useOrderStore` (Zustand) to manage `activeFilter` ('active' | 'completed') and `currentCompanyId`.
    - [ ] Implement `useOrders` hook (TanStack Query) to fetch `GET /worker/orders` with query keys dependent on `companyId` and `filter`.
    - [ ] Implement query persistence using `@tanstack/query-persist-client-core` (LocalStorage).

3.  **Phase 3: Component Development**
    - [ ] **CompanySwitcher**: Dropdown using Zustand for context switching.
    - [ ] **FilterTabs**: Segmented control for toggling active/completed tasks.
    - [ ] **OrderCard**: Detailed card showing name, type, client, qty/hours, and deadline.
    - [ ] **StatusBadge**: Utility component for color-coded status (New, In Progress, etc.).
    - [ ] **SkeletonLoader**: Shimmer cards matching "W1-loading" Figma spec.

4.  **Phase 4: Logic & Validation**
    - [ ] Apply Business Rule #2: Implement `isOverdue` or `isSoon` flag logic for deadline highlighting (red if tomorrow or overdue).
    - [ ] Apply Business Rule #3: Ensure default filter is `active`.
    - [ ] Implement "Pull-to-Refresh" using TMA SDK methods or native scroll behavior.

## External Dependencies
- `@telegram-apps/sdk-react`
- `@tanstack/react-query`
- `zustand`
- `axios`
- `date-fns` (for deadline logic)

## Developer Notes
- **TMA Theme**: Use CSS variables like `--tg-theme-bg-color` to inherit Telegram's UI colors.
- **Performance**: Use `memo` on `OrderCard` if list size exceeds 50 items to prevent unnecessary re-renders during filter switches.
- **Offline**: Check `navigator.onLine` or React Query's `isPaused` to display the "Offline" indicator.
