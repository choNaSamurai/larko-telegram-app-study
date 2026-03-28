# ADR-W1-01: Client-Side Architecture for Worker Task Feed

**Status**: ACCEPTED

## Context
The "My Tasks" (W1) screen is the primary interface for workers in the Larko Telegram Mini App. It must handle list fetching, filtering (Active/Completed), and provide a fast, responsive user experience within the Telegram Webview environment.

- Project Scope: Worker Task Management
- TMA Constraints: Telegram WebApp (webview), mobile-first, limited connectivity, performance priority.

## Problem
How to manage server state (task list) and client state (filters/company switching) while ensuring high performance and basic offline support?

## Options Considered

### Option 1: Redux + Axios
- Pros: Familiar, robust state management.
- Cons: High boilerplate, complex caching logic for offline support, heavier bundle size.

### Option 2: React Query + Zustand (Chosen)
- Pros: React Query simplifies server state (caching, loading/error states, re-validation). Zustand is extremely lightweight for client state (active company, filter toggle). Easy persistence through `persist` middleware and React Query persistence plugins.
- Cons: Learning curve for React Query's cache invalidation patterns.

## Decision
**React 18 + Vite + TanStack Query + Zustand with Persist Middleware.**

## Rationale
- **Performance**: Vite ensures fast HMR and optimized builds. React Query handles efficient data fetching and caching out-of-the-box.
- **Offline Support**: React Query's persistence enables viewing the last loaded task list when offline, matching the "Offline" NFR in the scenario.
- **Simplicity**: Zustand provides a minimal footprint for managing the global "Active Company" context and filter states.

## Consequences
- **Positive**: Declarative data fetching, reduced boilerplate, automatic background updates, and built-in loading/error state management.
- **Negative**: Adds two external dependencies (`zustand` and `@tanstack/react-query`).

## Future Considerations
- Migrate to Web Workers for heavy data processing if the task list grows exceptionally large (>1000 items).
- Implement WebSockets (via React Query's `onSuccess` or custom hook) for real-time task assignment notifications.
