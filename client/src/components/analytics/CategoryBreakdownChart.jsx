import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export const CategoryBreakdownChart = ({ categoryBreakdown = [] }) => {
  const activeCategories = categoryBreakdown.filter((c) => c.total > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-center py-10 text-slate-400 text-xs">
        No task history recorded in this period yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        Domain Balance
      </h3>
      <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Completed Tasks by Life Category
      </p>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeCategories}
              dataKey="completed"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {activeCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value, name) => [`${value} tasks completed`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 justify-center">
        {activeCategories.map((cat, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span>{cat.name} ({cat.completed})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
