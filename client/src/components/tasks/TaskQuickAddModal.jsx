import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { getTodayString, getTomorrowString } from '../../utils/dateUtils';

export const TaskQuickAddModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState('today'); // 'today' | 'tomorrow'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSelectedDay('today');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDate = selectedDay === 'tomorrow' ? tomorrowStr : todayStr;
      await onTaskCreated({
        title: title.trim(),
        scheduledDate
      });
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form: Title, Today/Tomorrow selector, Add Button */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Today / Tomorrow Selector Only */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedDay('today')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === 'today'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay('tomorrow')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === 'tomorrow'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Submit Button - Never Disabled */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold active:scale-98 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
