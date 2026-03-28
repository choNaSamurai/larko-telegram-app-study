# Tech Stack: SCREEN_W1_MyTasks

## §1. Overview
The "My Tasks" screen (W1) is the worker's home interface, showing assigned orders. It integrates with a global `CompanySwitcher` to scope data per-tenant and handles loading/error states for a premium mini-app experience.

## §2. Figma Designs
- **Active Tasks (Loading)**: [figma: 74:4931]
- **Active Tasks (Populated)**: [figma: 74:4556]
- **Empty State**: [figma: 74:4839]
- **Error State**: [figma: 83:6262]
- **Company Switcher**: [figma: 90:8503]

## §3. Core Stack
- **Framework**: React 18+ (Vite)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **State Mgmt**: Zustand (User context), TanStack Query (Server state)
- **Routing**: React Router v6

## §4. File Structure
- `src/features/tasks/components/TaskCard.tsx`
- `src/features/tasks/components/StatusBadge.tsx`
- `src/features/tasks/components/TaskFilter.tsx`
- `src/features/tasks/api/useTasks.ts` (Query hook)
- `src/features/tasks/services/TasksMockData.ts`
- `src/features/tasks/types.ts`
- `src/components/layout/CompanySwitcher.tsx`
- `src/store/useCompanyStore.ts` (Zustand)

## §5. Step-by-Step Implementation

### Step 1: Types & Mock Data
Define the task data model and mock service for development.
- **Traces to**: Scenario §11, BRD 2.0.153

### Step 2: Global State (Company Switcher)
Implement the `useCompanyStore` Zustand store to track the `activeCompanyId`.
- **Traces to**: Scenario §5 (A2), BRD 2.0.145

### Step 3: API Layer (React Query)
Create `useTasks` hook utilizing `activeCompanyId` to fetch data.
- **Traces to**: Scenario §10, BRD 2.0.164

### Step 4: UI Components (Atoms/Molecules)
Develop individual components: `StatusBadge`, `TaskFilter`, and `TaskCard`.
- **Traces to**: Scenario §7, BRD 2.0.159, 21.0.158

### Step 5: Screen Assembly
Build the main `W1TasksScreen` layout, integrating loading/empty/error states.
- **Traces to**: Scenario §8, BRD 2.0.165

## §6. TypeScript Interfaces
```typescript
/**
 * Programmatic values derived from Scenario §7 Status Bage.
 * DO NOT use Figma UX labels as code values.
 */
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED'; // from Scenario §7

export interface Task {
  id: string; // from Scenario §11
  orderNumber?: string; // from BRD 2.0.629
  productType: string; // from BRD 2.0.631
  clientName?: string; // from BRD 2.0.637
  quantity: number; // from BRD 2.0.632
  deadline: string; // ISO date string, from BRD 2.0.634
  status: TaskStatus;
}
```

## §7. External Dependencies
- `lucide-react`: Icons for product types.
- `date-fns`: Deadline parsing and comparison.

## §8. Developer Notes
- **React Query Cache**: 
    - `staleTime`: 1 * 60 * 1000 (1 minute)
    - `gcTime`: 5 * 60 * 1000 (5 minutes)
- **TMA BackButton**: The Home screen should disable the BackButton.
- **Offline assumption**: If data is missing or network fails, show the Error state with a retry option.
