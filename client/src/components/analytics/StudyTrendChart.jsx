import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const StudyTrendChart = ({ trendData = [] }) => {
  if (trendData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Effort Distribution
          </h3>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Technical Study vs Government Exam (Last 7 Days)
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="m" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="technicalMinutes" name="Tech Study (mins)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="governmentMinutes" name="Govt Exam (mins)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
