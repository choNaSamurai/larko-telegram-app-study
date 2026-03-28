import type { OrderFilter } from '../types';
import { cn } from '../utils/cn';

interface FilterTabsProps {
  activeFilter: OrderFilter;
  onFilterChange: (filter: OrderFilter) => void;
  counts?: { [K in OrderFilter]?: number };
}

const filters: { label: string; value: OrderFilter }[] = [
  { label: 'Усі', value: 'all' },
  { label: 'Нові', value: 'new' },
  { label: 'В процесі', value: 'in_progress' },
  { label: 'Виконані', value: 'completed' },
];

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = counts?.[filter.value];
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              isActive 
                ? "bg-white text-bg-primary shadow-sm" 
                : "border border-content-secondary text-content-secondary hover:bg-white/5"
            )}
          >
            {filter.label} {count !== undefined && `(${count})`}
          </button>
        );
      })}
    </div>
  );
}
