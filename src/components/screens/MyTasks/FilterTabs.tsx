// src/components/screens/MyTasks/FilterTabs.tsx
// Traces to: Scenario §7 Filter Tabs (Component 14), nodes 108:7626–108:7630
// Q5: counts calculated client-side from full task array
// Q6: filter tabs render ONLY after data loads — not during skeleton state

import { useTaskFilterStore } from '@/stores/useTaskFilterStore';
import type { Task, FilterTab } from '@/types/task.types';

interface FilterTabsProps {
  tasks: Task[];
}

interface TabDef {
  key: FilterTab;
  label: string;
  statuses: Task['status'][];
}

const TABS: TabDef[] = [
  { key: 'all',         label: 'Усі',       statuses: ['new','in_progress','overdue','checking','dispute','done'] },
  { key: 'new',         label: 'Нові',      statuses: ['new'] },
  { key: 'in_progress', label: 'В процесі', statuses: ['in_progress','overdue','checking','dispute'] },
  { key: 'done',        label: 'Виконані',  statuses: ['done'] },
];

export function FilterTabs({ tasks }: FilterTabsProps) {
  const { activeFilter, setFilter } = useTaskFilterStore();

  const getCount = (statuses: Task['status'][]) =>
    tasks.filter((t) => statuses.includes(t.status)).length;

  return (
    // pl-4 = 16px from Scenario §12.1 Spacing, height 34px, horizontal scroll
    <div className="flex items-center gap-2 pl-4 overflow-x-auto hide-scrollbar h-[34px] shrink-0 pb-0">
      {TABS.map((tab) => {
        const count = getCount(tab.statuses);
        const isActive = activeFilter === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={[
              'shrink-0 rounded-badge px-4 py-1.5 text-[14px] font-medium leading-5 transition-all duration-200',
              isActive
                ? 'bg-white text-[#222226]'
                : 'border border-[#878787] text-[#878787] hover:border-[#aaaaaa] hover:text-[#aaaaaa]',
            ].join(' ')}
          >
            {tab.label}
            {/* Show count only if > 0 and key is not 'done' (matches Figma) */}
            {count > 0 && tab.key !== 'done' && (
              <span className="ml-1">({count})</span>
            )}
          </button>
        );
      })}
      {/* Right padding sentinel */}
      <div className="w-4 shrink-0" />
    </div>
  );
}
