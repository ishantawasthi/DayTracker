import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Search,
  Plus,
  Sparkles,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { TaskCard } from '../components/tasks/TaskCard';
import { PlanTomorrowModal } from '../components/tasks/PlanTomorrowModal';
import { taskApi } from '../api/taskApi';
import { getTodayString } from '../utils/dateUtils';

export const TasksPage = () => {
  const { categories, onOpenQuickAdd } = useOutletContext();
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [isPlanTomorrowOpen, setIsPlanTomorrowOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        range: activeTab,
        category: selectedCategory || undefined,
        search: searchQuery || undefined
      };

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }

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
    <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Task Organizer
          </h1>
          <p className="text-[11px] text-slate-400">
            Today, tomorrow, and upcoming agendas
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlanTomorrowOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Plan Tomorrow</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Segmented View Switcher: Today, Tomorrow, Upcoming, All */}
      <div className="flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-semibold">
        {[
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'all', label: 'All' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overdue alert banner if on today tab */}
      {activeTab === 'today' && overdueTasks.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>{overdueTasks.length} overdue tasks</strong>
            </span>
          </div>
          <button
            onClick={handleMoveAllOverdueToToday}
            className="flex items-center gap-1 font-bold underline text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Move to Today</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter or search tasks..."
          className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Horizontal Category Scrollable Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('')}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelectedCategory(selectedCategory === c._id ? '' : c._id)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              selectedCategory === c._id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No tasks in {activeTab}.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                To Do ({pendingTasks.length})
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

          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Completed ({completedTasks.length})
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
