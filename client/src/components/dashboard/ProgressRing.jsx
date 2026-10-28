import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export const ProgressRing = ({
  completed = 0,
  pending = 0,
  total = 0,
  percentage = 0
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Today's Progress
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {percentage}% Done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* 3 Inline Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {completed}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Completed</div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {pending}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Pending</div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {total}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Total Planned</div>
        </div>
      </div>
    </div>
  );
};
