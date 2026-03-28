# ADR: W1 Centralized Routing and State

## Status
Proposed

## Context
The "My Tasks" (W1) screen is the entry point for workers and must support multi-tenant switching (companies) while integrating seamlessly with the Telegram Mini App (TMA) environment, particularly the native BackButton and offline-ready states.

## Decision
We will use **React Router** for global navigation, **Zustand** for cross-screen state (active company), and **TanStack Query** for data synchronization.

### 1. Global Centralized Navigation
Reject atomic prop-drilling navigation in favor of `react-router-dom`. All screen transitions (e.g., from W1 to Order Hub W2) will be handled by URL paths.
- **Rationale**: Supports TMA deep linking and allows the native `BackButton` to hook into the browser history/router state.

### 2. Multi-tenant State Management
Use a **Zustand store** (`useCompanyStore`) to hold the `activeCompanyId`.
- **Rationale**: Ensures that all API calls (via TanStack Query) are automatically scoped to the selected company. Switching companies in the header global component will trigger a refresh of all dependent queries.

### 3. Data Fetching & Caching
Use **TanStack Query** for fetching tasks.
- **Rationale**: Provides built-in loading/error states, automatic background refetching, and offline caching (stale-while-revalidate).

## Rationale
- **NFR Compliance**: Meets performance requirements for TMA delivery (low overhead).
- **UX Excellence**: Prevents inconsistent states when switching companies.
- **Maintainability**: Clear separation between UI components and data logic.

## Rejected Options
- **Prop-based navigation**: Rejected because it breaks deep linking and complex history management in TMA.
- **Redux for all state**: Rejected as overkill for a mini-app; Zustand provides a lighter, more ergonomic alternative for simple global tokens.
