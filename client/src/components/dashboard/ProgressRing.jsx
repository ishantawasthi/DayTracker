import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ProgressRing = ({
  completed = 0,
  pending = 0,
  total = 0,
  percentage = 0
}) => {
  const size = 110;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daily Completion
          </h3>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {percentage}% Finished
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
          Today
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Progress SVG */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {completed}/{total}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Done</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Completed
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{completed}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Pending
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{pending}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Total Planned</span>
            <span className="font-bold text-slate-900 dark:text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
