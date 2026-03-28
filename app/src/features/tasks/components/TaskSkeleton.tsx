import React from 'react';

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-2xl p-4 mb-4 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-800/50 h-12 rounded-xl mb-4 border border-slate-200 dark:border-slate-700/50"></div>
      
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-2 rounded-xl border border-white/20 dark:border-white/5">
        <div className="flex gap-4 w-full">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800"></div>
          <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
        </div>
      </div>
    </div>
  );
};
