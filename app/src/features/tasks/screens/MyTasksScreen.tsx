import React, { useState } from 'react';
import { RefreshCw, Search, Briefcase } from 'lucide-react';
import { TaskFilter } from '../components/TaskFilter';
import { OrderCard } from '../components/OrderCard';
import { TaskSkeleton } from '../components/TaskSkeleton';
import { useTasks } from '../hooks/useTasks';
import type { TaskFilterType } from '../types';

export const MyTasksScreen: React.FC = () => {
  const [filter, setFilter] = useState<TaskFilterType>('active');
  const { data: tasks, isLoading, isError, refetch } = useTasks(filter);

  const handleTaskClick = (id: string) => {
    console.log(`Navigate to Order Hub: ${id}`);
    // In real app: navigate(`/tasks/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 overflow-x-hidden">
      {/* Header Section */}
      <header className="px-5 pt-8 pb-4 flex flex-col gap-4 sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl z-20 transition-all border-b border-white/10 dark:border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
              DriveCode / Solar Solutions
            </p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              Завдання
            </h1>
          </div>
          <button className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 active:scale-90 transition-all">
            <Search size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        
        <TaskFilter activeFilter={filter} onFilterChange={setFilter} />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-2 flex flex-col h-full overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <TaskSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in px-4">
            <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/20 mb-6 group border border-rose-100 dark:border-rose-800/30">
              <RefreshCw size={48} className="text-rose-500 animate-spin-slow group-hover:rotate-180 transition-all duration-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Помилка завантаження
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px] mb-8 leading-relaxed">
              Не вдалося завантажити завдання. Перевірте інтернет-з'єднання.
            </p>
            <button 
              onClick={() => refetch()}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all text-sm"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/50 mb-6 border border-slate-200 dark:border-slate-700/50">
              <Briefcase size={48} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {filter === 'active' ? 'Немає активних завдань 🎉' : 'Немає завершених завдань'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[240px] leading-relaxed">
              {filter === 'active' 
                ? 'У вас немає призначених завдань на сьогодні. Відпочивайте або перевірте пізніше.' 
                : 'Ви ще не завершили жодного завдання у цій компанії.'}
            </p>
            <button 
              onClick={() => refetch()}
              className="mt-8 text-brand-primary font-bold text-sm bg-brand-primary/10 px-6 py-2.5 rounded-xl hover:bg-brand-primary/20 transition-all"
            >
              Оновити
            </button>
          </div>
        ) : (
          <div className="space-y-1">
             {tasks.map((task) => (
                <OrderCard 
                  key={task.id} 
                  task={task} 
                  onTap={handleTaskClick} 
                />
             ))}
             
             <div className="py-8 text-center">
                <p className="text-xs font-medium text-slate-400 opacity-50 uppercase tracking-widest">
                  Всі завдання завантажено
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
