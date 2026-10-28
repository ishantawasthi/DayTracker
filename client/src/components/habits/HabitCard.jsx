import React from 'react';
import { Flame, Check, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const HabitCard = ({
  habit,
  onToggleDate,
  onDelete
}) => {
  const isCompleted = habit.isCompletedToday;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#6366f1']
        });
      } catch (err) {}
    }
    onToggleDate(habit._id);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/25 dark:bg-emerald-950/15 border-emerald-200/50 dark:border-emerald-800/40'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0" onClick={handleToggle}>
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Complete habit'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Info */}
        <div className="min-w-0">
          <div
            className={`text-xs font-semibold truncate ${
              isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {habit.title}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
            {habit.category && (
              <span className="truncate max-w-[90px]">{habit.category.name}</span>
            )}
            <span>•</span>
            <span className="capitalize">
              {habit.targetFrequency === '5_days_week' ? '5d/wk' : habit.targetFrequency}
            </span>
          </div>
        </div>
      </div>

      {/* Streaks & Delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>{habit.currentStreak}d</span>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(habit._id)}
            className="p-1 text-slate-300 hover:text-rose-500 dark:text-slate-600 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
