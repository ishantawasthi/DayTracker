import React from 'react';

export const ProductivityHeatmap = ({ dayWiseTrend = [] }) => {
  if (dayWiseTrend.length === 0) return null;

  const getColor = (score) => {
    switch (score) {
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-950';
      case 2:
        return 'bg-indigo-300 dark:bg-indigo-800';
      case 3:
        return 'bg-indigo-500 dark:bg-indigo-600';
      case 4:
        return 'bg-indigo-700 dark:bg-indigo-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Productivity Heatmap
          </h3>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Consistency Matrix (Tasks + Study Time + Habits)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Low</span>
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-950" />
          <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-700" />
          <div className="w-3 h-3 rounded-sm bg-indigo-700 dark:bg-indigo-400" />
          <span>High</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-2">
        {dayWiseTrend.map((day) => (
          <div
            key={day.date}
            title={`${day.date} (${day.dayName}): ${day.completedTasks} tasks, ${day.studyMinutes}m study, ${day.habitsCompleted} habits`}
            className={`w-4 h-4 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${getColor(
              day.activityScore
            )}`}
          />
        ))}
      </div>
    </div>
  );
};
