import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Tag, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getTodayString, getTomorrowString } from '../../utils/dateUtils';
import { QUICK_TASK_TEMPLATES } from '../../utils/routinePresets';
import { IconHelper } from '../common/IconHelper';

export const TaskQuickAddModal = ({ isOpen, onClose, onTaskCreated, categories = [] }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTodayString());
  const [dateMode, setDateMode] = useState('today'); // 'today' | 'tomorrow' | 'custom'
  const [priority, setPriority] = useState('medium');
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setScheduledDate(getTodayString());
      setDateMode('today');
      setPriority('medium');
      setScheduledTime('');
      setEstimatedDuration('');
      setNotes('');
      setShowAdvanced(false);
      setShowPresets(false);
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0]._id);
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, categories]);

  const handleDateModeChange = (mode) => {
    setDateMode(mode);
    if (mode === 'today') setScheduledDate(getTodayString());
    else if (mode === 'tomorrow') setScheduledDate(getTomorrowString());
  };

  const handleApplyPreset = (tpl) => {
    setTitle(tpl.title);
    setPriority(tpl.priority);
    if (tpl.duration) setEstimatedDuration(tpl.duration);
    const matched = categories.find((c) => c.name.toLowerCase() === tpl.categoryName.toLowerCase());
    if (matched) setCategoryId(matched._id);
    setShowPresets(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onTaskCreated({
        title: title.trim(),
        category: categoryId || (categories[0] ? categories[0]._id : undefined),
        scheduledDate,
        scheduledTime,
        priority,
        estimatedDuration: estimatedDuration ? Number(estimatedDuration) : 0,
        notes
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick Add Task</h2>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Presets
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Picker Dropdown */}
        {showPresets && (
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Tap a routine preset to autofill:</p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {QUICK_TASK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(tpl)}
                  className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-xs"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Java for 45 mins, Go to gym, Buy groceries..."
              className="w-full text-base font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
              required
            />
          </div>

          {/* Date Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDateModeChange('today')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  dateMode === 'today'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateModeChange('tomorrow')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  dateMode === 'tomorrow'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDateMode('custom')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  dateMode === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Custom Date
              </button>
            </div>
            {dateMode === 'custom' && (
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full mt-2 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat._id;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left truncate transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#6366f1' }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</label>
            <div className="flex items-center gap-2">
              {[
                { id: 'low', label: 'Low', color: 'border-slate-200 text-slate-600 dark:text-slate-400' },
                { id: 'medium', label: 'Medium', color: 'border-amber-200 text-amber-600 dark:text-amber-400' },
                { id: 'high', label: 'High Priority', color: 'border-rose-200 text-rose-600 dark:text-rose-400' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    priority === p.id
                      ? p.id === 'high'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : p.id === 'medium'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : `bg-white dark:bg-slate-800 ${p.color} border-slate-200 dark:border-slate-700 hover:bg-slate-50`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced fields expander */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAdvanced ? 'Hide optional fields' : 'Add time, duration, or notes'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Scheduled Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full mt-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Est. Duration (mins)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      placeholder="e.g. 45"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full mt-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Extra details, links, or sub-points..."
                    className="w-full mt-1 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isSubmitting ? 'Saving task...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
