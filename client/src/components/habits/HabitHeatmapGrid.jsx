import React from 'react';

export const HabitHeatmapGrid = ({ dateCounts = {}, days = 60 }) => {
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Consistency Heatmap ({days}d)
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span>Less</span>
          <div className="w-2 h-2 rounded-xs bg-slate-100 dark:bg-slate-800" />
          <div className="w-2 h-2 rounded-xs bg-emerald-300 dark:bg-emerald-700" />
          <div className="w-2 h-2 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of cells */}
      <div className="flex flex-wrap gap-1 pt-1 justify-start">
        {cells.map((cell) => (
          <div
            key={cell.dateStr}
            title={`${cell.displayDate}: ${cell.count} habits completed`}
            className={`w-3.5 h-3.5 rounded-[3px] transition-transform active:scale-125 cursor-pointer ${getColorClass(
              cell.count
            )}`}
          />
        ))}
      </div>
    </div>
  );
};
