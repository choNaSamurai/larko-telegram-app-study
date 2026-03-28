import React from 'react';
import { ChevronDown, Briefcase } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCompanyStore } from '../../store/useCompanyStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * CompanySwitcher header component.
 * Traces to Scenario §7, Figma [90:8503].
 */
export const CompanySwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { activeCompanyId, companies, setActiveCompany } = useCompanyStore();
  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800', className)}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden">
          {activeCompany?.logo ? (
            <img src={activeCompany.logo} alt={activeCompany.name} className="w-full h-full object-contain" />
          ) : (
            <Briefcase className="w-4 h-4 text-zinc-400" />
          )}
        </div>
        <div className="flex flex-col -space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            Active Company
          </span>
          <button className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-white group">
            {activeCompany?.name || 'Select Company'}
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-accent-blue transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
