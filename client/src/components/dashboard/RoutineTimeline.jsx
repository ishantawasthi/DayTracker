import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Briefcase, Dumbbell, Code2, BookOpen, ShoppingCart, CalendarClock } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const timeInMins = currentHour * 60 + currentMinutes;

  const getActiveIndex = () => {
    if (timeInMins >= 390 && timeInMins < 510) return 0; // 6:30 - 8:30
    if (timeInMins >= 510 && timeInMins < 570) return 1; // 8:30 - 9:30
    if (timeInMins >= 600 && timeInMins < 1140) return 2; // 10:00 - 19:00
    if (timeInMins >= 1170 && timeInMins < 1230) return 3; // 19:30 - 20:30
    if (timeInMins >= 1230 && timeInMins < 1350) return 4; // 20:30 - 22:30
    if (timeInMins >= 1350 && timeInMins < 1440) return 5; // 22:30 - 23:00
    return 2; // Default to office block during workday
  };

  const activeIdx = getActiveIndex();
  const currentBlock = ROUTINE_BLOCKS[activeIdx];
  const CurrentIcon = ICON_MAP[currentBlock.icon] || Clock;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      {/* Current Active Block Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs"
            style={{ backgroundColor: currentBlock.color }}
          >
            <CurrentIcon className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentBlock.title}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentBlock.timeRange}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-1 rounded-lg"
        >
          <span>{isExpanded ? 'Hide' : 'Full Schedule'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Full Routine List */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fade-in">
          {ROUTINE_BLOCKS.map((block, idx) => {
            const Icon = ICON_MAP[block.icon] || Clock;
            const active = idx === activeIdx;

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs transition-all ${
                  active
                    ? 'border-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-800/20'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: block.color }}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {block.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{block.timeRange}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{block.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
