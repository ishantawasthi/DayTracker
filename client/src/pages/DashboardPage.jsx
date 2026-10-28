import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Sparkles, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { MotivationCard } from '../components/dashboard/MotivationCard';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { RoutineTimeline } from '../components/dashboard/RoutineTimeline';
import { PriorityTasksWidget } from '../components/dashboard/PriorityTasksWidget';
import { TaskCard } from '../components/tasks/TaskCard';
import { PlanTomorrowModal } from '../components/tasks/PlanTomorrowModal';
import { taskApi } from '../api/taskApi';
import { getTodayString } from '../utils/dateUtils';
import { useSync } from '../context/SyncContext';

export const DashboardPage = () => {
  const { categories, onOpenQuickAdd } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
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

    const handleTaskUpdated = () => {
      fetchDashboardData();
    };
    window.addEventListener('daytrack:task-updated', handleTaskUpdated);
    return () => window.removeEventListener('daytrack:task-updated', handleTaskUpdated);
  }, []);

  const handleToggleTask = async (id) => {
    // Optimistic update
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

  const pendingTasks = summary?.todayTasks?.filter((t) => t.status === 'pending') || [];
  const completedTasks = summary?.todayTasks?.filter((t) => t.status === 'completed') || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Motivation & Greeting Card */}
      <MotivationCard onPlanTomorrowClick={() => setIsPlanTomorrowOpen(true)} />

      {/* Overdue alert if any */}
      {summary?.overdueCount > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              You have <strong>{summary.overdueCount} unfinished tasks</strong> from previous days.
            </span>
          </div>
          <button
            onClick={() => setIsPlanTomorrowOpen(true)}
            className="font-semibold underline hover:text-amber-800 dark:hover:text-amber-300"
          >
            Review & Reschedule
          </button>
        </div>
      )}

      {/* 2-Column Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Tasks & Priorities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks Widget */}
          <PriorityTasksWidget
            priorityTasks={summary?.highPriorityTasks || []}
            onToggle={handleToggleTask}
            onReschedule={handleRescheduleTask}
            onDelete={handleDeleteTask}
          />

          {/* Today's Tasks Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Execution List
                </h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  What needs to get done today
                </p>
              </div>
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your day...</div>
            ) : summary?.todayTasks?.length === 0 ? (
              <div className="text-center py-10 px-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks planned yet today!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Add your morning study, gym goals, groceries, or office priorities to kick off your day.
                </p>
                <button
                  onClick={onOpenQuickAdd}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      To Do ({pendingTasks.length})
                    </div>
                    {pendingTasks.map((task) => (
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

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Completed Today ({completedTasks.length})
                    </div>
                    {completedTasks.map((task) => (
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
            )}
          </div>
        </div>

        {/* Right Column (1 col): Progress Ring & Routine Blueprint */}
        <div className="space-y-6">
          <ProgressRing
            completed={summary?.completedToday || 0}
            pending={summary?.pendingToday || 0}
            total={summary?.totalToday || 0}
            percentage={summary?.completionPercentage || 0}
          />

          <RoutineTimeline />
        </div>
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
