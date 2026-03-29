// src/components/screens/MyTasks/MyTasksScreen.tsx
// Traces to: Scenario §4 Main Flow, §8 Screen States, ADR-001-A/B
import type { BottomNavTab } from '@/components/BottomNav';
// CONSTRAINT: Screen root must contain deriveScreenState() — never inline in JSX

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWorkerTasks } from '@/services/tasksService';
import { useTaskFilterStore } from '@/stores/useTaskFilterStore';
import type { Task, ScreenState, FilterTab } from '@/types/task.types';

import { MyTasksHeader } from './MyTasksHeader';
import { FilterTabs } from './FilterTabs';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from './TaskCardSkeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { BottomNav } from '@/components/BottomNav';

/**
 * Pure state machine function — maps query state to typed ScreenState.
 * CONSTRAINT from tma_implementer.yaml: NEVER inline this logic in JSX.
 */
function deriveScreenState(
  isLoading: boolean,
  isError: boolean,
  data: Task[] | undefined,
): ScreenState {
  if (isLoading) return 'loading';
  if (isError)   return 'error';
  if (!data || data.length === 0) return 'empty';
  return 'populated';
}

/**
 * Compute filtered task list for the active filter tab.
 * Counts: Scenario §5.3, Q5 — calculated client-side.
 */
function filterTasks(tasks: Task[], filter: FilterTab): Task[] {
  switch (filter) {
    case 'new':
      return tasks.filter((t) => t.status === 'new');
    case 'in_progress':
      return tasks.filter((t) =>
        ['in_progress', 'overdue', 'checking', 'dispute'].includes(t.status),
      );
    case 'done':
      return tasks.filter((t) => t.status === 'done');
    default:
      return tasks;
  }
}

interface MyTasksScreenProps {
  onTabChange?: (tab: BottomNavTab) => void;
  onTaskSelect?: (taskId: string) => void;
}

export function MyTasksScreen({ onTabChange, onTaskSelect }: MyTasksScreenProps) {
  const { activeFilter } = useTaskFilterStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchWorkerTasks,
    staleTime: 5 * 60 * 1000,  // 5 min — ADR-001-A
    retry: 2,
  });

  const screenState = deriveScreenState(isLoading, isError, data);

  const filteredTasks = useMemo(
    () => filterTasks(data ?? [], activeFilter),
    [data, activeFilter],
  );

  return (
    <div className="flex flex-col h-full bg-bg-screen">
      {/* Header — always visible, contains safe-area-inset-top */}
      <MyTasksHeader />

      {/* ── Loading State ─────────────────────────────────────────────────── */}
      {screenState === 'loading' && (
        // Q6: Filter tabs NOT shown during loading — only after data loads
        <div className="flex flex-col gap-3 p-4 overflow-auto flex-1 min-h-0 hide-scrollbar">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      )}

      {/* ── Error State ───────────────────────────────────────────────────── */}
      {screenState === 'error' && (
        <ErrorState onRetry={() => void refetch()} />
      )}

      {/* ── Populated / Empty (after data loads) ─────────────────────────── */}
      {(screenState === 'populated' || screenState === 'empty') && data && (
        <>
          {/* Filter tabs — Q6: only after data loads */}
          <div className="mt-3 mb-3">
            <FilterTabs tasks={data} />
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState onRefresh={() => void refetch()} />
          ) : (
            // Cards feed: p-4 (16px), gap-3 (12px) — Scenario §12.1 Spacing
            <div className="flex flex-col gap-3 px-4 pb-4 overflow-auto flex-1 min-h-0 hide-scrollbar">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onPress={onTaskSelect ? () => onTaskSelect(task.id) : undefined} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Bottom nav — always visible, Tasks tab active */}
      <BottomNav activeTab="tasks" onTabChange={onTabChange} />
    </div>
  );
}
