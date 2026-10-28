import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  BookOpen,
  Send,
  History,
  Check
} from 'lucide-react';
import { reviewApi } from '../api/reviewApi';
import { taskApi } from '../api/taskApi';
import { getTodayString, getTomorrowString, formatDisplayDate } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

export const ReviewPage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [wentWell, setWentWell] = useState('');
  const [toImprove, setToImprove] = useState('');
  const [rolloverTaskIds, setRolloverTaskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSummary = async () => {
    try {
      const todayStr = getTodayString();
      const [sumRes, histRes] = await Promise.all([
        reviewApi.getTodaySummary(todayStr),
        reviewApi.getHistory(10)
      ]);

      if (sumRes.success) {
        setSummary(sumRes.data);
        if (sumRes.data.existingReview) {
          setWentWell(sumRes.data.existingReview.wentWellNotes || '');
          setToImprove(sumRes.data.existingReview.toImproveNotes || '');
          setIsSaved(true);
        }
        // By default, select all pending tasks for rollover
        setRolloverTaskIds((sumRes.data.tasksPending || []).map((t) => t._id));
      }
      if (histRes.success) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const toggleRolloverTask = (id) => {
    setRolloverTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const todayStr = getTodayString();
      const tomorrowStr = getTomorrowString();

      // Rollover selected pending tasks to tomorrow
      if (rolloverTaskIds.length > 0) {
        await taskApi.batchPlanTomorrow({
          moveTaskIds: rolloverTaskIds,
          newTasks: [],
          tomorrowDate: tomorrowStr
        });
      }

      // Submit review
      await reviewApi.submitReview({
        date: todayStr,
        wentWellNotes: wentWell,
        toImproveNotes: toImprove,
        tasksCompleted: summary?.tasksCompletedCount || 0,
        tasksPending: summary?.tasksPendingCount || 0,
        totalStudyMinutes: summary?.totalStudyMinutes || 0,
        habitsCompleted: summary?.habitsCompletedCount || 0
      });

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setIsSaved(true);
      fetchSummary();
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tasksCompletedCount = summary?.tasksCompletedCount || 0;
  const tasksPendingCount = summary?.tasksPendingCount || 0;
  const totalTasks = tasksCompletedCount + tasksPendingCount;
  const completionRate = totalTasks === 0 ? 0 : Math.round((tasksCompletedCount / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>End-of-Day Review & Reflection</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          A calm, non-judgmental space to review your efforts, rollover leftovers, and prepare tomorrow.
        </p>
      </div>

      {/* Gentle tone banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 text-xs leading-relaxed">
        <strong>Remember:</strong> Consistent progress matters far more than perfection. Living alone while working full-time is demanding. Every bit of technical study, workout, or clean chore you did today moves you forward.
      </div>

      {/* Day's Accomplishments Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Tasks Done</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {tasksCompletedCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {completionRate}% of planned
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {tasksPendingCount}
          </div>
          <div className="text-[11px] text-slate-400">
            Can rollover to tomorrow
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Study Time</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {summary?.totalStudyMinutes || 0}m
          </div>
          <div className="text-[11px] text-slate-400">
            Actual stopwatch logged
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Habits Done</span>
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-500 mt-1">
            {summary?.habitsCompletedCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Routine check-ins
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="space-y-5">
        {/* Unfinished tasks rollover selector */}
        {tasksPendingCount > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Rollover Unfinished Tasks to Tomorrow</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                {rolloverTaskIds.length} of {tasksPendingCount} selected
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Unchecked tasks will remain in backlog. Checked tasks will automatically appear on tomorrow's dashboard.
            </p>

            <div className="space-y-1.5">
              {(summary?.tasksPending || []).map((task) => {
                const isSelected = rolloverTaskIds.includes(task._id);
                return (
                  <div
                    key={task._id}
                    onClick={() => toggleRolloverTask(task._id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="flex-1 font-medium truncate">{task.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {task.category?.name || 'General'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection Prompts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>What went well today?</span>
            </label>
            <textarea
              rows={3}
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="e.g. Woke up on time, solved 2 DSA graph problems, ate healthy homemade dinner..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One thing to improve tomorrow</span>
            </label>
            <textarea
              rows={2}
              value={toImprove}
              onChange={(e) => setToImprove(e.target.value)}
              placeholder="e.g. Avoid phone scrolling after returning from office; start technical study right at 8:30 PM..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Send className="w-4 h-4" />}
            <span>{isSubmitting ? 'Saving Review...' : isSaved ? 'Update Day Review' : 'Complete & Save Review'}</span>
          </button>
        </div>
      </form>

      {/* Historical Reviews */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Previous Daily Reflections
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {history.map((rev) => (
              <div
                key={rev._id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span>{formatDisplayDate(rev.date)}</span>
                  <span className="text-[11px] text-slate-400">
                    {rev.tasksCompleted} tasks • {rev.totalStudyMinutes}m study
                  </span>
                </div>
                {rev.wentWellNotes && (
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-emerald-600 dark:text-emerald-400">Went well:</strong> {rev.wentWellNotes}
                  </p>
                )}
                {rev.toImproveNotes && (
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong className="text-amber-600 dark:text-amber-400">To improve:</strong> {rev.toImproveNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
