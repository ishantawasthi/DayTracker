import React from 'react';
import { Clock, Briefcase, Dumbbell, Code2, BookOpen, ShoppingCart, CalendarClock } from 'lucide-react';
import { ROUTINE_BLOCKS } from '../../utils/routinePresets';

const ICON_MAP = {
  Dumbbell,
  Code2,
  Briefcase,
  ShoppingCart,
  BookOpen,
  CalendarClock
};

export const RoutineTimeline = () => {
  // Determine current active block based on current hour
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const timeInMins = currentHour * 60 + currentMinutes;

  const isCurrentBlock = (index) => {
    // 0: 6:30 - 8:30 (390 - 510)
    // 1: 8:30 - 9:30 (510 - 570)
    // 2: 10:00 - 19:00 (600 - 1140)
    // 3: 19:30 - 20:30 (1170 - 1230)
    // 4: 20:30 - 22:30 (1230 - 1350)
    // 5: 22:30 - 23:00 (1350 - 1380)
    if (index === 0) return timeInMins >= 390 && timeInMins < 510;
    if (index === 1) return timeInMins >= 510 && timeInMins < 570;
    if (index === 2) return timeInMins >= 600 && timeInMins < 1140;
    if (index === 3) return timeInMins >= 1170 && timeInMins < 1230;
    if (index === 4) return timeInMins >= 1230 && timeInMins < 1350;
    if (index === 5) return timeInMins >= 1350 && timeInMins < 1440;
    return false;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daily Routine Blueprint
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Job: 10 AM – 7 PM</span>
      </div>

      <div className="space-y-3">
        {ROUTINE_BLOCKS.map((block, idx) => {
          const Icon = ICON_MAP[block.icon] || Clock;
          const active = isCurrentBlock(idx);

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                active
                  ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/30'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs"
                style={{ backgroundColor: block.color }}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {block.title}
                    </span>
                    {active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                        Current Block
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {block.timeRange}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {block.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
