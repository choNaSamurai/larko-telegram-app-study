// src/stores/useTaskFilterStore.ts
// ADR-001-B: Zustand for filter state — persists across bottom nav tab switches
import { create } from 'zustand';
import type { FilterTab } from '@/types/task.types';

interface TaskFilterState {
  activeFilter: FilterTab;
  setFilter: (tab: FilterTab) => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  activeFilter: 'all',
  setFilter: (tab) => set({ activeFilter: tab }),
}));
