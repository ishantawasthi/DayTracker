import React from 'react';
import { Check, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayString, getTomorrowString } from '../../utils/dateUtils';

export const TaskCard = ({
  task,
  onToggle,
  onReschedule,
  onDelete
}) => {
  const isCompleted = task.status === 'completed';
  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();
  const isToday = task.scheduledDate === todayStr;

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981']
        });
      } catch (err) {}
    }
    onToggle(task._id);
  };

  const handleMove = (e) => {
    e.stopPropagation();
    if (isToday) {
      onReschedule(task._id, tomorrowStr);
    } else {
      onReschedule(task._id, todayStr);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id);
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-3 transition-all ${
        isCompleted
          ? 'border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Checkbox + Title */}
      <div
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
        onClick={handleToggleClick}
      >
        <button
          type="button"
          onClick={handleToggleClick}
          className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? 'Mark pending' : 'Mark completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <span
          className={`text-sm font-medium leading-tight truncate ${
            isCompleted
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Action buttons: Move (Today <-> Tomorrow) + Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!isCompleted && (
          <button
            type="button"
            onClick={handleMove}
            title={isToday ? 'Move to Tomorrow' : 'Move to Today'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isToday ? (
              <>
                <span className="hidden sm:inline">Tomorrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Today</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          title="Delete task"
          className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
