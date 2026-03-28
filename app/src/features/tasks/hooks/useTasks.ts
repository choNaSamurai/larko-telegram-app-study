import { useQuery } from '@tanstack/react-query';
import type { Task, TaskFilterType } from '../types';
import { MOCK_TASKS } from '../services/TasksMockData';

/**
 * Custom hook for fetching and filtering tasks.
 * In a real app, this would call an API service.
 * Traces to: Tech Stack § useTasks.ts, Scenario §9
 */
export const useTasks = (filter: TaskFilterType) => {
  return useQuery<Task[]>({
    queryKey: ['tasks', filter],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (filter === 'completed') {
        return MOCK_TASKS.filter((t) => t.status === 'DONE');
      }

      return MOCK_TASKS.filter((t) => t.status !== 'DONE');
    },
    staleTime: 60000, // 1 minute (as per ADR)
  });
};
