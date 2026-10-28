import React from 'react';
import { getTodayString } from '../../utils/dateUtils';

export const HabitHeatmapGrid = ({ dateCounts = {}, days = 60 }) => {
  // Generate array of past `days` dates
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const count = dateCounts[dateStr] || 0;

    cells.push({
      dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    });
  }

  const getColorClass = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (count === 2) return 'bg-emerald-300 dark:bg-emerald-700';
    if (count === 3) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Consistency Heatmap (Last {days} Days)
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of cells */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {cells.map((cell) => (
          <div
            key={cell.dateStr}
            title={`${cell.displayDate}: ${cell.count} habits completed`}
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${getColorClass(
              cell.count
            )}`}
          />
        ))}
      </div>
    </div>
  );
};
