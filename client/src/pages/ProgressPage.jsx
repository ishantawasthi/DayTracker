import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle,
  Flame,
  Calendar,
  Layers
} from 'lucide-react';
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
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysRange]);

  const summary = data?.summary || {};

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Header and Range Filter */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Progress & History</span>
          </h1>
          <p className="text-[11px] text-slate-400">
            Track your consistency and completed tasks over time
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

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {summary.totalCompletedCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            Tasks done
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Consistency
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {summary.overallCompletionRate || 0}%
          </div>
          <div className="text-[10px] text-slate-400">
            Completion rate
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Habits
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {summary.activeHabitsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            Active streaks
          </div>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <ProductivityHeatmap dayWiseTrend={data?.dayWiseTrend || []} />

      {/* Category Breakdown */}
      <CategoryBreakdownChart categoryBreakdown={data?.categoryBreakdown || []} />
    </div>
  );
};
