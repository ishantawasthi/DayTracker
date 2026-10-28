import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  Plus,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { TaskCard } from '../components/tasks/TaskCard';
import { PlanTomorrowModal } from '../components/tasks/PlanTomorrowModal';
import { taskApi } from '../api/taskApi';
import { getTodayString, getTomorrowString } from '../utils/dateUtils';

export const TasksPage = () => {
  const { categories, onOpenQuickAdd } = useOutletContext();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'tomorrow' | 'upcoming' | 'all'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [isPlanTomorrowOpen, setIsPlanTomorrowOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const todayStr = getTodayString();
      const params = {
        range: activeTab,
        category: selectedCategory || undefined,
        search: searchQuery || undefined
      };

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }

      // Check overdue tasks if on today tab
      if (activeTab === 'today') {
        const overdueRes = await taskApi.getTasks({ range: 'overdue' });
        if (overdueRes.success) {
          setOverdueTasks(overdueRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab, selectedCategory, searchQuery]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('daytrack:task-updated', handleUpdate);
    return () => window.removeEventListener('daytrack:task-updated', handleUpdate);
  }, [activeTab, selectedCategory]);

  const handleToggle = async (id) => {
    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
    try {
      await taskApi.toggleTask(id);
    } catch (err) {
      fetchTasks();
    }
  };

  const handleReschedule = async (id, newDate) => {
    try {
      await taskApi.rescheduleTask(id, newDate);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setOverdueTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveAllOverdueToToday = async () => {
    try {
      const todayStr = getTodayString();
      await Promise.all(
        overdueTasks.map((t) => taskApi.rescheduleTask(t._id, todayStr))
      );
      setOverdueTasks([]);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header & Planning Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Task Management & Planning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize today, schedule tomorrow, and build daily consistency.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPlanTomorrowOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Plan Tomorrow</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Overdue alert banner if on today's view */}
      {activeTab === 'today' && overdueTasks.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>{overdueTasks.length} unfinished tasks</strong> from previous days.
            </span>
          </div>
          <button
            onClick={handleMoveAllOverdueToToday}
            className="flex items-center gap-1 font-semibold underline hover:text-amber-800 dark:hover:text-amber-300"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Move all to Today</span>
          </button>
        </div>
      )}

      {/* Main Tabs (Today, Tomorrow, Upcoming, All) */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 max-w-md">
        {[
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'all', label: 'All Tasks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pr-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(selectedCategory === c._id ? '' : c._id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedCategory === c._id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No tasks found in {activeTab}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'tomorrow'
              ? 'Click "Plan Tomorrow" above to prepare your schedule before sleeping!'
              : 'Add your study sessions, gym workouts, or groceries.'}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Add Task Now
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                <span>To Do ({pendingTasks.length})</span>
              </div>
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onReschedule={handleReschedule}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Completed ({completedTasks.length})</span>
              </div>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onReschedule={handleReschedule}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plan Tomorrow Modal */}
      <PlanTomorrowModal
        isOpen={isPlanTomorrowOpen}
        onClose={() => setIsPlanTomorrowOpen(false)}
        todayPendingTasks={pendingTasks}
        categories={categories}
        onPlanSaved={fetchTasks}
      />
    </div>
  );
};
