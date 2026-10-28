import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  ArrowRight,
  RotateCcw,
  Edit2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayString, getTomorrowString, formatDisplayDate } from '../../utils/dateUtils';

export const TaskCard = ({
  task,
  onToggle,
  onReschedule,
  onDelete,
  onEdit
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
      // Trigger a subtle, celebratory confetti pop
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#3b82f6']
        });
      } catch (err) {
        // Safe fallback if canvas is unavailable
      }
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
      className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-3.5 sm:p-4 transition-all duration-150 hover:shadow-sm ${
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-65 bg-slate-50/50 dark:bg-slate-900/30'
          : isOverdue
          ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Touch-Friendly Checkbox */}
        <button
          onClick={handleToggleClick}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug break-words ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.title}
            </span>

            {/* High priority badge */}
            {task.priority === 'high' && !isCompleted && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50">
                High
              </span>
            )}
          </div>

          {/* Badges / Metadata row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            {/* Category tag */}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.category.color || '#6366f1' }}
                />
                <span className="truncate max-w-[120px]">{task.category.name}</span>
              </span>
            )}

            {/* Scheduled Date */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                isOverdue
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue ? `Overdue (${formatDisplayDate(task.scheduledDate)})` : formatDisplayDate(task.scheduledDate)}
            </span>

            {/* Scheduled Time */}
            {task.scheduledTime && (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {task.scheduledTime}
              </span>
            )}

            {/* Duration */}
            {task.estimatedDuration > 0 && (
              <span className="inline-flex items-center text-[11px] text-slate-400">
                {task.estimatedDuration}m est
              </span>
            )}

            {/* Notes preview toggle */}
            {task.notes && (
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="inline-flex items-center gap-0.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <FileText className="w-3 h-3" />
                <span>Notes</span>
              </button>
            )}
          </div>

          {/* Expanded Notes display */}
          {showNotes && task.notes && (
            <div className="mt-2 text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
              {task.notes}
            </div>
          )}
        </div>

        {/* Quick Actions (Move to tomorrow, more options) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isCompleted && task.scheduledDate === todayStr && (
            <button
              onClick={handleMoveToTomorrow}
              title="Move to Tomorrow"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {!isCompleted && task.scheduledDate !== todayStr && (
            <button
              onClick={handleMoveToToday}
              title="Move to Today"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                {task.scheduledDate !== tomorrowStr && (
                  <button
                    onClick={handleMoveToTomorrow}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Move to Tomorrow</span>
                  </button>
                )}
                {task.scheduledDate !== todayStr && (
                  <button
                    onClick={handleMoveToToday}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Move to Today</span>
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Task</span>
                  </button>
                )}
                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task._id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
