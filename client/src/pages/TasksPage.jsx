import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import { TaskCard } from '../components/tasks/TaskCard';
import { taskApi } from '../api/taskApi';
import { getTodayString, getTomorrowString, shiftDate, formatDisplayDate } from '../utils/dateUtils';
import { useSync } from '../context/SyncContext';

export const TasksPage = () => {
  const { categories, onOpenQuickAdd } = useOutletContext();
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'all'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);

  const { isOnline, queueAction } = useSync();

  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (viewMode === 'daily') {
        params.date = currentDate;
      } else {
        params.range = 'all';
      }
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentDate, viewMode, selectedCategory, searchQuery]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('daytrack:task-updated', handleUpdate);
    return () => window.removeEventListener('daytrack:task-updated', handleUpdate);
  }, [currentDate, viewMode]);

  const handleInlineAddTask = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsAdding(true);
    const targetDate = viewMode === 'daily' ? currentDate : todayStr;
    const taskData = {
      title: quickTitle.trim(),
      scheduledDate: targetDate,
      category: quickCategory || (categories[0] ? categories[0]._id : undefined),
      priority: quickPriority
    };

    try {
      if (!isOnline) {
        queueAction({ type: 'CREATE_TASK', data: taskData });
      } else {
        await taskApi.createTask(taskData);
      }
      setQuickTitle('');
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setIsAdding(false);
    }
  };

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
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevDay = () => {
    setViewMode('daily');
    setCurrentDate((prev) => shiftDate(prev, -1));
  };

  const handleNextDay = () => {
    setViewMode('daily');
    setCurrentDate((prev) => shiftDate(prev, 1));
  };

  const handleSetToday = () => {
    setViewMode('daily');
    setCurrentDate(todayStr);
  };

  const handleSetTomorrow = () => {
    setViewMode('daily');
    setCurrentDate(tomorrowStr);
  };

  const handleSetAllHistory = () => {
    setViewMode('all');
  };

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const totalCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const displayedTasks =
    filterStatus === 'pending'
      ? pendingTasks
      : filterStatus === 'completed'
      ? completedTasks
      : tasks;

  // Group tasks by date when viewing "All Tasks (History)"
  const groupedTasks = {};
  if (viewMode === 'all') {
    displayedTasks.forEach((t) => {
      const d = t.scheduledDate || 'Unscheduled';
      if (!groupedTasks[d]) groupedTasks[d] = [];
      groupedTasks[d].push(t);
    });
  }

  return (
    <div className="space-y-3.5 animate-fade-in max-w-2xl mx-auto">
      {/* 1. Date Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          {/* Previous day arrow */}
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Current Date Display */}
          <div className="text-center flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>{viewMode === 'all' ? 'All Tasks History' : formatDisplayDate(currentDate)}</span>
              {viewMode === 'daily' && currentDate === todayStr && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            {viewMode === 'daily' && (
              <span className="text-[10px] text-slate-400 font-medium">
                {currentDate}
              </span>
            )}
          </div>

          {/* Next day arrow */}
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Pills: Today, Tomorrow, All History, Date Picker */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSetToday}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'daily' && currentDate === todayStr
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={handleSetTomorrow}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'daily' && currentDate === tomorrowStr
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tomorrow
          </button>
          <button
            onClick={handleSetAllHistory}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All History
          </button>

          {/* Date Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  setViewMode('daily');
                  setCurrentDate(e.target.value);
                }
              }}
              className="w-8 h-7 opacity-0 absolute inset-0 cursor-pointer"
              title="Pick specific date"
            />
            <div className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 pointer-events-none">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fast Inline Task Creator */}
      <form
        onSubmit={handleInlineAddTask}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-2xs space-y-2"
      >
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={
              viewMode === 'daily' && currentDate === todayStr
                ? 'Add task for Today...'
                : viewMode === 'daily' && currentDate === tomorrowStr
                ? 'Add task for Tomorrow...'
                : 'Add a new task...'
            }
            className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={isAdding || !quickTitle.trim()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Category & Priority selectors */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="text-[11px] px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Category: Default</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              className="text-[11px] px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
          </div>
        </div>
      </form>

      {/* 3. Daily Completion Bar & Filters */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {completedCount} of {totalCount} done
          </span>
          {totalCount > 0 && (
            <span className="text-[10px] text-slate-400 font-semibold">
              ({completionPercentage}%)
            </span>
          )}
        </div>

        {/* Status Filter Chips: All, To Do, Done */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `To Do (${pendingTasks.length})` },
            { id: 'completed', label: `Done (${completedTasks.length})` }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterStatus === s.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Line */}
      {totalCount > 0 && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      {/* 4. Task List */}
      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">Loading saved tasks...</div>
      ) : displayedTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center space-y-1">
          <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto opacity-70 mb-1" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {viewMode === 'all'
              ? 'No tasks found in your history.'
              : totalCount === 0
              ? `No tasks scheduled for ${formatDisplayDate(currentDate)}.`
              : 'No tasks match your filter.'}
          </p>
          <p className="text-[11px] text-slate-400">
            Type in the box above to add a task that saves permanently.
          </p>
        </div>
      ) : viewMode === 'all' ? (
        /* History Grouped by Date */
        <div className="space-y-4">
          {Object.keys(groupedTasks)
            .sort((a, b) => (b > a ? 1 : -1))
            .map((dateKey) => (
              <div key={dateKey} className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                  <span>{formatDisplayDate(dateKey)} ({dateKey})</span>
                  <span>{groupedTasks[dateKey].length} tasks</span>
                </div>
                <div className="space-y-1.5">
                  {groupedTasks[dateKey].map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onReschedule={handleReschedule}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Daily View */
        <div className="space-y-2">
          {displayedTasks.map((task) => (
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
  );
};
