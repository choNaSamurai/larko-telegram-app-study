# tech-stack/TECH_STACK_W1_MyTasks.md

# Tech Stack: W1 My Tasks Screen Implementation (Worker)

## Overview
Technical specification for the primary task feed screen. Focuses on performance, offline capability, and premium aesthetics.

## Figma Designs
- Figma Node: `77:5261` (W1: My Tasks)
- Main/Loading/Empty/Error states: `74:4556`, `74:4885`, `74:4795`, `83:6218`

## Core Stack
- **Framework**: React 18 + Vite (Mobile-First)
- **Styling**: Tailwind CSS + Glassmorphism (`backdrop-blur`)
- **State**: Zustand (Local UI state), TanStack Query v5 (Data sync)
- **Routing**: `react-router-dom`
- **Validation**: Zod (for API response validation)
- **Icons**: `Lucide React`

## File Structure
- `src/features/tasks/components/OrderCard.tsx` - Reusable task card component.
- `src/features/tasks/components/StatusBadge.tsx` - Color-coded status indicator.
- `src/features/tasks/components/TaskFilter.tsx` - "Active / Completed" switcher.
- `src/features/tasks/components/TaskSkeleton.tsx` - Skeleton loader for tasks.
- `src/features/tasks/hooks/useTasks.ts` - Custom hook for fetching and filtering tasks via TanStack Query.
- `src/features/tasks/screens/MyTasksScreen.tsx` - Main screen container.
- `src/features/tasks/services/TasksMockData.ts` - Development mock data (Success, Empty, Error).

## Step-by-Step Implementation

1. **Setup Mock Data**: Create `TasksMockData.ts` with diverse task statuses and overdue deadlines.  
   *(Traces to: Scenario §8, BRD Rule #3)*
2. **Implement Reusable Components**: Build `StatusBadge` and `OrderCard` with Tailwind glassmorphism.  
   *(Traces to: Scenario §7, BRD Rule #153)*
3. **Build Screen Container**: Implement `MyTasksScreen.tsx` using `useTasks` hook and routing-based filtering.  
   *(Traces to: Scenario §3 & §4.A, ADR Decision #1)*
4. **Implement UI States**: Add `TaskSkeleton`, `EmptyState`, and `ErrorState` components.  
   *(Traces to: Scenario §6.AC.4)*
5. **Logic: Deadline Highlighting**: Add calculation logic for red color on dates $\le$ (Today + 1 day).  
   *(Traces to: Scenario §4.B, BRD Rule #158)*
6. **Integration**: Connect to the global Bottom Navigation and Sidebar switcher.  
   *(Traces to: Scenario §5, BRD Rule #163)*

## TypeScript Interfaces
```typescript
/** 
 * Derived from Scenario §8 Status Definitions 
 * values: 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED'
 */
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

/** Derived from Scenario §9 API Contract */
export interface Task {
  id: string;
  orderNumber?: string;
  productType: string;
  clientName: string;
  address: string;
  deadline: string; // ISO8601
  status: TaskStatus;
  notesPreview: string;
  earnedAmount: number;
  workerAvatars: string[];
  isUrgent: boolean;
}

/** Derived from Scenario §6.AC.3 Filtering */
export type TaskFilterType = 'active' | 'completed'; // default: 'active'
```

## Developer Notes
- **API Cache**: Set `staleTime` to 60s to prevent excessive re-fetching while switching between tabs.
- **Persistence**: Use TanStack Query's `persistQueryClient` with `createSyncStoragePersister` for offline support.
- **Error Handling**: Use an inline Error State [figma: 83:6218] with a "Try Again" button to retrace the query.

## Fallback Assumptions
- **Q3 fallback (Lead Worker Badge)**: If the "Lead Worker" requirement (BRD 293) is not yet implemented in the data layer, show the standard worker avatar stack for now. Override when stakeholder confirms backend support.
