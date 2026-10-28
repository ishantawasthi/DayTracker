import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { MotivationCard } from '../components/dashboard/MotivationCard';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { RoutineTimeline } from '../components/dashboard/RoutineTimeline';
import { TaskCard } from '../components/tasks/TaskCard';
import { PlanTomorrowModal } from '../components/tasks/PlanTomorrowModal';
import { taskApi } from '../api/taskApi';
import { getTodayString } from '../utils/dateUtils';
import { useSync } from '../context/SyncContext';

export const DashboardPage = () => {
  const { categories, onOpenQuickAdd } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [isPlanTomorrowOpen, setIsPlanTomorrowOpen] = useState(false);
  const { isOnline } = useSync();

  const fetchDashboardData = async () => {
    try {
      const todayStr = getTodayString();
      const res = await taskApi.getDashboardSummary(todayStr);
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleTaskUpdated = () => fetchDashboardData();
    window.addEventListener('daytrack:task-updated', handleTaskUpdated);
    return () => window.removeEventListener('daytrack:task-updated', handleTaskUpdated);
  }, []);

  const handleToggleTask = async (id) => {
    setSummary((prev) => {
      if (!prev) return prev;
      const updatedList = prev.todayTasks.map((t) =>
        t._id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      );
      const completed = updatedList.filter((t) => t.status === 'completed').length;
      const total = updatedList.length;
      return {
        ...prev,
        todayTasks: updatedList,
        completedToday: completed,
        pendingToday: total - completed,
        completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100)
      };
    });

    try {
      await taskApi.toggleTask(id);
    } catch (err) {
      fetchDashboardData();
    }
  };

  const handleRescheduleTask = async (id, newDate) => {
    try {
      await taskApi.rescheduleTask(id, newDate);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskApi.deleteTask(id);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const allTodayTasks = summary?.todayTasks || [];
  const pendingTasks = allTodayTasks.filter((t) => t.status === 'pending');
  const completedTasks = allTodayTasks.filter((t) => t.status === 'completed');

  const filteredTasks =
    taskFilter === 'pending'
      ? pendingTasks
      : taskFilter === 'completed'
      ? completedTasks
      : allTodayTasks;

  return (
    <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
      {/* Top Greeting & Date */}
      <MotivationCard onPlanTomorrowClick={() => setIsPlanTomorrowOpen(true)} />

      {/* 2-Column Responsive: Progress & Routine side-by-side on tablet/desktop, stacked lean on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ProgressRing
          completed={summary?.completedToday || 0}
          pending={summary?.pendingToday || 0}
          total={summary?.totalToday || 0}
          percentage={summary?.completionPercentage || 0}
        />
        <RoutineTimeline />
      </div>

      {/* Overdue alert if any */}
      {summary?.overdueCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>{summary.overdueCount} unfinished tasks</strong> from previous days.
            </span>
          </div>
          <button
            onClick={() => setIsPlanTomorrowOpen(true)}
            className="font-bold underline text-[11px]"
          >
            Review
          </button>
        </div>
      )}

      {/* Today's Tasks Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3">
        {/* Section Header with Segmented Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Plan
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              ({completedTasks.length}/{allTodayTasks.length})
            </span>
          </div>

          {/* Quick Filter: All / Pending / Done */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'To Do' },
              { id: 'completed', label: 'Done' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTaskFilter(f.id)}
                className={`px-2.5 py-0.5 rounded-md transition-all ${
                  taskFilter === f.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading today's schedule...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 px-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {allTodayTasks.length === 0
                ? "No tasks scheduled for today."
                : taskFilter === 'pending'
                ? "All caught up! Great job."
                : "No completed tasks yet."}
            </p>
            {allTodayTasks.length === 0 && (
              <button
                onClick={onOpenQuickAdd}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggleTask}
                onReschedule={handleRescheduleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Plan Tomorrow Modal */}
      <PlanTomorrowModal
        isOpen={isPlanTomorrowOpen}
        onClose={() => setIsPlanTomorrowOpen(false)}
        todayPendingTasks={pendingTasks}
        categories={categories}
        onPlanSaved={fetchDashboardData}
      />
    </div>
  );
};
