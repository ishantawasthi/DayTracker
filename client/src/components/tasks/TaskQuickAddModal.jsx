import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getTodayString, getTomorrowString } from '../../utils/dateUtils';
import { QUICK_TASK_TEMPLATES } from '../../utils/routinePresets';

export const TaskQuickAddModal = ({ isOpen, onClose, onTaskCreated, categories = [] }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTodayString());
  const [dateMode, setDateMode] = useState('today');
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
      setTimeout(() => inputRef.current?.focus(), 100);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs transition-opacity">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Mobile Bottom Sheet / Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Add</h2>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full"
            >
              <Sparkles className="w-3 h-3" />
              Presets
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Routine Presets Banner */}
        {showPresets && (
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tap preset to fill:</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {QUICK_TASK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(tpl)}
                  className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg active:scale-95 transition-all"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
              required
            />
          </div>

          {/* Date Chips */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'custom', label: 'Pick Date' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleDateModeChange(chip.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  dateMode === chip.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {dateMode === 'custom' && (
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {/* Category Chips (Horizontal Scrollable for clean thumb navigation) */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => {
                const isSelected = categoryId === cat._id;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#6366f1' }}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'low', label: 'Low' },
              { id: 'medium', label: 'Medium' },
              { id: 'high', label: 'High Priority' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-all ${
                  priority === p.id
                    ? p.id === 'high'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : p.id === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Expandable Advanced Fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{showAdvanced ? 'Fewer options' : '+ Add time, duration, or note'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Est. Mins</label>
                    <input
                      type="number"
                      step="5"
                      placeholder="e.g. 45"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Short note or reminder..."
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
