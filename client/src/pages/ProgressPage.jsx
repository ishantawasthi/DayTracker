import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle,
  Dumbbell,
  Clock,
  Flame,
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
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
      {/* Header and Range Filter */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Growth & Analytics</span>
          </h1>
          <p className="text-[11px] text-slate-400">
            Honest metrics on tasks, study hours, and habits
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center p-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg text-xs font-semibold">
          {[
            { id: 7, label: '7d' },
            { id: 30, label: '30d' },
            { id: 90, label: '90d' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setDaysRange(r.id)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                daysRange === r.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lean Mobile Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.overallCompletionRate || 0}%
          </div>
          <div className="text-[10px] text-slate-400">
            {summary.totalCompletedCount || 0} tasks done
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Study Hours</span>
            <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {summary.totalStudyHours || 0}h
          </div>
          <div className="text-[10px] text-slate-400">
            Recorded focus
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Gym / Fitness</span>
            <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.fitnessSessionsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            Workouts logged
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Active Habits</span>
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.activeHabitsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            Discipline drivers
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <ProductivityHeatmap dayWiseTrend={data?.dayWiseTrend || []} />

      {/* Charts */}
      <div className="space-y-4">
        <StudyTrendChart trendData={last7DaysTrend} />
        <CategoryBreakdownChart categoryBreakdown={data?.categoryBreakdown || []} />
      </div>
    </div>
  );
};
