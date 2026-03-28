import { useQuery } from '@tanstack/react-query';
import type { FilterGroup, Task } from '../types';
import { getMockTasks } from '../services/TasksMockData';
import { useCompanyStore } from '../../../store/useCompanyStore';

/**
 * Custom hook for fetching tasks based on active company and filter group.
 * Traces to Scenario §10 and Tech Stack §8.
 */
export const useTasks = (filter: FilterGroup) => {
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);

  return useQuery<Task[]>({
    queryKey: ['tasks', activeCompanyId, filter],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!activeCompanyId) return [];

      return getMockTasks(filter);
    },
    enabled: !!activeCompanyId,
    staleTime: 1 * 60 * 1000, // 1 minute (from Tech Stack §8)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
