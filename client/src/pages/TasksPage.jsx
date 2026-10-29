import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { TaskCard } from '../components/tasks/TaskCard';
import { taskApi } from '../api/taskApi';
import { getTodayString, getTomorrowString } from '../utils/dateUtils';
import { useSync } from '../context/SyncContext';

export const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'tomorrow'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickTitle, setQuickTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { isOnline, queueAction } = useSync();
  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  const activeDate = activeTab === 'tomorrow' ? tomorrowStr : todayStr;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks({ date: activeDate });
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
  }, [activeTab]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('daytrack:task-updated', handleUpdate);
    return () => window.removeEventListener('daytrack:task-updated', handleUpdate);
  }, [activeTab]);

  const handleInlineAddTask = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsAdding(true);
    const taskData = {
      title: quickTitle.trim(),
      scheduledDate: activeDate
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

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
      {/* 1. Only Today & Tomorrow Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'today'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tomorrow')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tomorrow'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Tomorrow
        </button>
      </div>

      {/* 2. Fast Inline Task Input */}
      <form onSubmit={handleInlineAddTask} className="flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder={activeTab === 'today' ? 'Add task for today...' : 'Add task for tomorrow...'}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-2xs"
        />
        <button
          type="submit"
          disabled={isAdding || !quickTitle.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold active:scale-95 transition-all shadow-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </form>

      {/* 3. Simple Counter / Progress (if tasks exist) */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
          <span className="font-semibold">
            {completedCount} of {totalCount} completed
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {percentage}%
          </span>
        </div>
      )}

      {/* 4. Task List */}
      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center space-y-1.5">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-60 mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'today' ? 'No tasks for today' : 'No tasks for tomorrow'}
          </p>
          <p className="text-xs text-slate-400">
            {activeTab === 'today'
              ? 'Type a task above to plan your day.'
              : 'Add upcoming tasks to plan ahead.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
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
