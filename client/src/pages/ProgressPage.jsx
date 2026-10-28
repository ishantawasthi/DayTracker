import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Dumbbell,
  Clock,
  Flame,
  Award,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { StudyTrendChart } from '../components/analytics/StudyTrendChart';
import { CategoryBreakdownChart } from '../components/analytics/CategoryBreakdownChart';
import { ProductivityHeatmap } from '../components/analytics/ProductivityHeatmap';
import { analyticsApi } from '../api/analyticsApi';

export const ProgressPage = () => {
  const [daysRange, setDaysRange] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getOverview(daysRange);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysRange]);

  const summary = data?.summary || {};
  const last7DaysTrend = data?.dayWiseTrend?.slice(-7) || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Progress & Personal Growth</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Honest metrics tracking task completion, recorded study hours, and lifestyle consistency.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl text-xs font-semibold">
          {[
            { id: 7, label: '7 Days' },
            { id: 30, label: '30 Days' },
            { id: 90, label: '90 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setDaysRange(r.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                daysRange === r.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.overallCompletionRate || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.totalCompletedCount || 0} of {summary.totalTasks || 0} tasks
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Recorded Study
            </span>
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {summary.totalStudyHours || 0} hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {(summary.totalTechStudyMinutes || 0) + (summary.totalGovtStudyMinutes || 0)} actual mins
          </div>
        </div>

        {/* Tech Study vs Govt Exam */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Study Split
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 space-y-0.5">
            <div className="text-blue-600 dark:text-blue-400">
              💻 {Math.round((summary.totalTechStudyMinutes || 0) / 60)}h Tech
            </div>
            <div className="text-amber-600 dark:text-amber-400">
              📚 {Math.round((summary.totalGovtStudyMinutes || 0) / 60)}h Govt
            </div>
          </div>
        </div>

        {/* Gym & Workout Consistency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Gym / Fitness
            </span>
            <Dumbbell className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.fitnessSessionsCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Workouts logged
          </div>
        </div>

        {/* Active Habits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Habits
            </span>
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.activeHabitsCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Routine drivers
          </div>
        </div>
      </div>

      {/* Productivity Heatmap Matrix */}
      <ProductivityHeatmap dayWiseTrend={data?.dayWiseTrend || []} />

      {/* 2-Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Trend Chart */}
        <StudyTrendChart trendData={last7DaysTrend} />

        {/* Category Breakdown Chart */}
        <CategoryBreakdownChart categoryBreakdown={data?.categoryBreakdown || []} />
      </div>
    </div>
  );
};
