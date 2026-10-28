import React from 'react';
import { Flame, Check, MoreVertical, Trash2 } from 'lucide-react';
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
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#6366f1']
        });
      } catch (err) {}
    }
    onToggleDate(habit._id);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Complete habit'}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold truncate ${
                isCompleted
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {habit.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            {habit.category && (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: habit.category.color || '#10b981' }}
                />
                <span className="truncate max-w-[100px]">{habit.category.name}</span>
              </span>
            )}

            <span className="text-[11px] text-slate-400 capitalize">
              {habit.targetFrequency === '5_days_week' ? '5 days/week' : habit.targetFrequency}
            </span>
          </div>
        </div>
      </div>

      {/* Streaks & Delete */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{habit.currentStreak}d</span>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(habit._id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
