# Tech Stack Specification: SCREEN_W1_My_Tasks

## Overview
Technical blueprint for implementing the "My Tasks" vertical feed for workers. Focuses on performance, modularity, and Telegram Mini App integration.

## Figma Designs
- **Screen (Primary)**: [W1-screen-primary](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4556&m=dev), [W1-screen-secondary](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=194-6622&m=dev)
- **Loading State**: [W1-loading-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4885&m=dev), [W1-loading-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4931&m=dev)
- **Empty State**: [W1-empty-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4795&m=dev), [W1-empty-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4839&m=dev)
- **Error State**: [W1-error-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6218&m=dev), [W1-error-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6262&m=dev)
- **Company Switcher**: [Switcher-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=90-8571&m=dev), [Switcher-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=90-8503&m=dev)

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

## TypeScript Interfaces

```typescript
export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'blocked';
export type OrderFilter = 'active' | 'completed';

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Order {
  id: string;
  title: string;
  status: OrderStatus;
  companyId: string;
  companyName: string;
  clientName: string;
  address: string;
  deadline: string;           // ISO 8601 date string, e.g. "2026-04-01"
  cost: number;               // Rate Snapshot — locked at creation (BRD Rule #4)
  currency: string;           // e.g. "UAH"
  notes?: string;             // Manager instructions preview
  quantityOrHours: number;
  unit: 'qty' | 'hours';
}

// GET /worker/orders
export interface GetOrdersRequest {
  companyId: string;
  filter: OrderFilter;
}

export interface GetOrdersResponse {
  data: Order[];
}
```

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
