import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Header } from './Header';
import { TaskQuickAddModal } from '../tasks/TaskQuickAddModal';
import { categoryApi } from '../../api/categoryApi';
import { taskApi } from '../../api/taskApi';
import { useSync } from '../../context/SyncContext';

export const AppLayout = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { isOnline, queueAction } = useSync();

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleTaskCreated = async (taskData) => {
    if (!isOnline) {
      queueAction({ type: 'CREATE_TASK', data: taskData });
      alert('Task queued offline. Will sync automatically when reconnected.');
      return;
    }
    const res = await taskApi.createTask(taskData);
    window.dispatchEvent(new CustomEvent('daytrack:task-updated'));
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onQuickAdd={() => setIsQuickAddOpen(true)} />

        <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 pb-mobile-nav">
          <Outlet context={{ categories, onOpenQuickAdd: () => setIsQuickAddOpen(true) }} />
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsQuickAddOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-13 h-13 w-[52px] h-[52px] rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white shadow-lg shadow-indigo-600/35 flex items-center justify-center transition-all duration-150"
        aria-label="Quick Add Task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Quick Add Modal / Mobile Bottom Sheet */}
      <TaskQuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
