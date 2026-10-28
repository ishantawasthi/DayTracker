import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
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
        setRolloverTaskIds((sumRes.data.tasksPending || []).map((t) => t._id));
      }
      if (histRes.success) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.error('Failed to load review:', err);
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

      if (rolloverTaskIds.length > 0) {
        await taskApi.batchPlanTomorrow({
          moveTaskIds: rolloverTaskIds,
          newTasks: [],
          tomorrowDate: tomorrowStr
        });
      }

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
          particleCount: 40,
          spread: 60,
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

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Daily Review & Reflection</span>
        </h1>
        <p className="text-[11px] text-slate-400">
          Wrap up your day with calmness and prepare for tomorrow
        </p>
      </div>

      {/* Accomplishments in 2x2 grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {tasksCompletedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Tasks Completed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {tasksPendingCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Left to Rollover</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {summary?.totalStudyMinutes || 0}m
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Study Logged</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-rose-500">
            {summary?.habitsCompletedCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Habits Checked</div>
        </div>
      </div>

      {/* Rollover section */}
      {tasksPendingCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Move to Tomorrow</span>
            <span className="text-[11px] text-indigo-600 font-medium">{rolloverTaskIds.length} selected</span>
          </div>

          <div className="space-y-1">
            {(summary?.tasksPending || []).map((task) => {
              const isSelected = rolloverTaskIds.includes(task._id);
              return (
                <div
                  key={task._id}
                  onClick={() => toggleRolloverTask(task._id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="flex-1 truncate">{task.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflection inputs */}
      <form onSubmit={handleSubmitReview} className="space-y-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              What went well today?
            </label>
            <textarea
              rows={2}
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="e.g. Completed morning DSA study, ate clean food..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              One thing to improve tomorrow
            </label>
            <textarea
              rows={2}
              value={toImprove}
              onChange={(e) => setToImprove(e.target.value)}
              placeholder="e.g. Put phone away after 10 PM, sleep by 11:30 PM..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Saving...' : isSaved ? 'Updated Review' : 'Save Today\'s Review'}</span>
          </button>
        </div>
      </form>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Past Reflections</span>
          </div>

          <div className="space-y-2 pt-1">
            {history.slice(0, 5).map((rev) => (
              <div
                key={rev._id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span>{formatDisplayDate(rev.date)}</span>
                  <span className="text-[10px] text-slate-400">
                    {rev.tasksCompleted} tasks • {rev.totalStudyMinutes}m study
                  </span>
                </div>
                {rev.wentWellNotes && (
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    <strong className="text-emerald-600 dark:text-emerald-400">Well:</strong> {rev.wentWellNotes}
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
