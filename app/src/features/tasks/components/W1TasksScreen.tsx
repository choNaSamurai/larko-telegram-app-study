import React, { useState, useEffect } from 'react';
import { LayoutList, Search, RefreshCcw, User } from 'lucide-react';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { useTasks } from '../api/useTasks';
import type { FilterGroup, Task } from '../types';
import { TaskCard } from './TaskCard';
import { TaskFilter } from './TaskFilter';
import { CompanySwitcher } from '../../../components/layout/CompanySwitcher';

type ScreenState = 'loading' | 'error' | 'empty' | 'populated';

/**
 * Pure state machine driving the UI.
 * Traces to implementer role constraint: deriveScreenState().
 */
const deriveScreenState = (
  isLoading: boolean,
  isError: boolean,
  data: Task[] | undefined
): ScreenState => {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  if (!data || data.length === 0) return 'empty';
  return 'populated';
};

/**
 * Main W1 Tasks Screen component.
 * Traces to Scenario §1, Figma [74:4556].
 */
const W1TasksScreen: React.FC = () => {
  const [filter, setFilter] = useState<FilterGroup>('active');
  const { isLoading, isError, data, refetch } = useTasks(filter);
  const { setCompanies, companies } = useCompanyStore();

  // Initialize mock companies for dev
  useEffect(() => {
    if (companies.length === 0) {
      setCompanies([
        { id: 'c1', name: 'Larko Logistics' },
        { id: 'c2', name: 'Elite Electronics' },
      ]);
    }
  }, [companies.length, setCompanies]);

  const state = deriveScreenState(isLoading, isError, data);

  const handleTaskClick = (id: string) => {
    console.log(`Navigate to Task ${id}`);
    // Navigation to W2 Hub will be handled by React Router in Step 10.
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <CompanySwitcher />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
            My Tasks
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Manage your assigned orders in real-time
          </p>
        </div>

        {/* Global Filter */}
        <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-3 -mx-4 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-4">
          <TaskFilter activeGroup={filter} onFilterChange={setFilter} />
        </div>

        {/* State Handler */}
        {state === 'loading' && (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-accent-red/10 rounded-full mb-4">
              <RefreshCcw className="w-8 h-8 text-accent-red" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Load Failed</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Could not fetch your tasks. Check connection.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-accent-blue text-white rounded-xl font-bold shadow-lg shadow-accent-blue/30 active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'empty' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
              <LayoutList className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {filter === 'completed' ? 'No Completed Orders' : 'No Active Orders'}
            </h2>
            <p className="text-sm text-zinc-500">
              Tasks assigned to you will appear here automatically.
            </p>
          </div>
        )}

        {state === 'populated' && data && (
          <div className="space-y-4 py-2">
            {data.map((task) => (
              <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Mockup - Real one will be in App.tsx */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-8 pb-4">
        <button className="flex flex-col items-center text-accent-blue scale-110">
          <LayoutList className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-0.5">Tasks</span>
        </button>
        <button className="flex flex-col items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-0.5">History</span>
        </button>
        <button className="flex flex-col items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default W1TasksScreen;
