# adr/ADR_W1_MyTasks.md

# ADR: W1 My Tasks Screen Architecture

## Status
Proposed

## Context
The **W1: My Tasks** screen is the primary interface for workers. It requires high responsiveness, offline capability, and seamless integration with the Telegram Mini App environment. The screen displays a filtered list of orders/tasks with real-time status updates.

## Decision
1. **Global Routing & Navigation**: Use `react-router-dom` for application routing. This ensures that every screen state (including task filters) can be represented by a URL path or query parameter, enabling the native Telegram **BackButton** to work as expected for navigation history.
2. **Data Fetching & Cache**: Use **TanStack Query (React Query)** for server state. 
   - `staleTime: 60000` (1 minute) for tasks.
   - `gcTime: 300000` (5 minutes).
   - Enable **Persistence** (Local Storage) to allow workers to see their task list immediately upon opening the app, even without a network connection.
3. **State Management**: Use **Zustand** for lightweight client-side state (active company, theme, search queries).
4. **UI Architecture**: Follow a **Feature-Based Atomic Design**. Components like `OrderCard` will be standalone and reusable.
5. **Aesthetics**: Implement **Glassmorphism** using Tailwind CSS `backdrop-blur` and custom gradients to meet the "Premium" design requirement.

## Rationale
- **BackButton**: TMA users expect the native back button to work. If we use internal `useState` for switching between "Active" and "Completed", the back button will exit the app instead of switching tabs. Routing-based state avoids this. (Traces to: Scenario §5 & §11).
- **Offline Reliability**: Workers may use the app in areas with poor cellular signal (e.g., workshops, construction sites). Caching the task list is critical for usability. (Traces to: Scenario §12.1).
- **Performance**: TanStack Query's caching and background fetching ensure the UI remains snappy.

## Rejected Options
- **Prop-based Navigation**: Rejected because it breaks browser/TMA history and makes deep linking impossible.
- **Redux**: Rejected as overkill for the current state complexity; Zustand + TanStack Query is more efficient for typical TMA use cases.
