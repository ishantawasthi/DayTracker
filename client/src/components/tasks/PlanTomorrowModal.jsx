import React, { useState } from 'react';
import { X, Calendar, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';
import { getTomorrowString } from '../../utils/dateUtils';
import { taskApi } from '../../api/taskApi';

const DEFAULT_TOMORROW_SUGGESTIONS = [
  'Morning workout / Gym (Chest & Triceps)',
  'Solve 2 DSA problems before work',
  'Attend office (10:00 AM - 07:00 PM)',
  'Revise Core Java concepts after office',
  'Practice SSC CGL Quantitative Aptitude',
  'Buy groceries (Eggs, bananas, vegetables)',
  'Prepare food and pack lunch for next day',
  'Pack clothes and bag for tomorrow',
  'Review DayTrack & sleep before 11:30 PM'
];

export const PlanTomorrowModal = ({
  isOpen,
  onClose,
  todayPendingTasks = [],
  categories = [],
  onPlanSaved
}) => {
  const [selectedPendingIds, setSelectedPendingIds] = useState(
    todayPendingTasks.map((t) => t._id)
  );
  const [customTomorrowTasks, setCustomTomorrowTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const tomorrowStr = getTomorrowString();

  const togglePendingTask = (id) => {
    setSelectedPendingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomTask = (text) => {
    const val = (text || newTaskInput).trim();
    if (!val) return;
    if (!customTomorrowTasks.includes(val)) {
      setCustomTomorrowTasks([...customTomorrowTasks, val]);
    }
    setNewTaskInput('');
  };

  const handleRemoveCustomTask = (index) => {
    setCustomTomorrowTasks(customTomorrowTasks.filter((_, i) => i !== index));
  };

  const handleSavePlan = async () => {
    setIsSubmitting(true);
    try {
      const defaultCat = categories[0]?._id;
      const tasksToCreate = customTomorrowTasks.map((title) => ({
        title,
        category: defaultCat,
        priority: 'medium'
      }));

      await taskApi.batchPlanTomorrow({
        moveTaskIds: selectedPendingIds,
        newTasks: tasksToCreate,
        tomorrowDate: tomorrowStr
      });

      if (onPlanSaved) onPlanSaved();
      onClose();
    } catch (err) {
      console.error('Failed to plan tomorrow:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Plan Tomorrow</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set yourself up for a calm, productive day tomorrow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Section 1: Rollover pending tasks from today */}
          {todayPendingTasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Rollover Unfinished Tasks ({selectedPendingIds.length}/{todayPendingTasks.length})</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                  Checked tasks will move to tomorrow
                </span>
              </h3>
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {todayPendingTasks.map((task) => {
                  const isChecked = selectedPendingIds.includes(task._id);
                  return (
                    <div
                      key={task._id}
                      onClick={() => togglePendingTask(task._id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex-1 truncate">{task.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Add specific tasks for tomorrow */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Add Tasks for Tomorrow
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTask();
                  }
                }}
                placeholder="e.g. Study DSA 45 mins, Buy groceries..."
                className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomTask()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* List of custom tasks to create */}
            {customTomorrowTasks.length > 0 && (
              <div className="mt-2.5 space-y-1">
                {customTomorrowTasks.map((taskTitle, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                  >
                    <span>{taskTitle}</span>
                    <button
                      onClick={() => handleRemoveCustomTask(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Recommended Routine Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Presets for Working Professionals</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TOMORROW_SUGGESTIONS.map((sug, i) => {
                const isAdded = customTomorrowTasks.includes(sug);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddCustomTask(sug)}
                    className={`text-left text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isAdded
                        ? 'opacity-40 cursor-default border-slate-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 active:scale-95'
                    }`}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={isSubmitting || (selectedPendingIds.length === 0 && customTomorrowTasks.length === 0)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? 'Saving Tomorrow...' : 'Save Tomorrow Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
