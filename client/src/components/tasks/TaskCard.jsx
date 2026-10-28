import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  RotateCcw,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayString, getTomorrowString, formatDisplayDate } from '../../utils/dateUtils';

export const TaskCard = ({
  task,
  onToggle,
  onReschedule,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isCompleted = task.status === 'completed';
  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();
  const isOverdue = task.scheduledDate < todayStr && !isCompleted;

  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 24,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#3b82f6']
        });
      } catch (err) {}
    }
    onToggle(task._id);
  };

  const handleMoveToTomorrow = (e) => {
    e.stopPropagation();
    onReschedule(task._id, tomorrowStr);
    setShowMenu(false);
  };

  const handleMoveToToday = (e) => {
    e.stopPropagation();
    onReschedule(task._id, todayStr);
    setShowMenu(false);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-3 sm:p-3.5 transition-all duration-150 active:bg-slate-50/80 dark:active:bg-slate-800/50 ${
        isCompleted
          ? 'border-slate-200/50 dark:border-slate-800/40 opacity-55 bg-slate-50/40 dark:bg-slate-900/20'
          : isOverdue
          ? 'border-amber-300/80 dark:border-amber-800/60 bg-amber-50/15'
          : 'border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Touch Checkbox */}
        <button
          onClick={handleToggleClick}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? 'Mark pending' : 'Mark completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0" onClick={handleToggleClick}>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={`text-sm font-medium leading-tight select-none ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.title}
            </span>

            {task.priority === 'high' && !isCompleted && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" title="High Priority" />
            )}
          </div>

          {/* Clean metadata line */}
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-400 dark:text-slate-500">
            {task.category && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.category.color || '#6366f1' }}
                />
                <span className="truncate max-w-[110px]">{task.category.name}</span>
              </span>
            )}

            {task.scheduledTime && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {task.scheduledTime}
              </span>
            )}

            {task.estimatedDuration > 0 && (
              <span>{task.estimatedDuration}m</span>
            )}

            {task.notes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotes(!showNotes);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                <FileText className="w-2.5 h-2.5" />
                <span>note</span>
              </button>
            )}
          </div>

          {showNotes && task.notes && (
            <div className="mt-2 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {task.notes}
            </div>
          )}
        </div>

        {/* Action Buttons: 1-Tap Move to Tomorrow */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!isCompleted && task.scheduledDate === todayStr && (
            <button
              onClick={handleMoveToTomorrow}
              title="Move to Tomorrow"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!isCompleted && task.scheduledDate !== todayStr && (
            <button
              onClick={handleMoveToToday}
              title="Move to Today"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-7 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleMoveToTomorrow}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tomorrow</span>
                </button>
                <button
                  onClick={handleMoveToToday}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Today</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task._id);
                  }}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
