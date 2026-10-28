import React from 'react';
import { Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaskCard } from '../tasks/TaskCard';
import { Link } from 'react-router-dom';

export const PriorityTasksWidget = ({
  priorityTasks = [],
  onToggle,
  onReschedule,
  onDelete
}) => {
  if (priorityTasks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Today's Top Priorities ({priorityTasks.length})
          </h3>
        </div>
        <Link
          to="/tasks"
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {priorityTasks.slice(0, 3).map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onToggle={onToggle}
            onReschedule={onReschedule}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
