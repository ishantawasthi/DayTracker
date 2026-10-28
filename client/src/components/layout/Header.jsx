import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, WifiOff, CalendarCheck, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

export const Header = ({ onQuickAdd }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, offlineQueue } = useSync();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Title or Desktop Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">DayTrack</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
              Personal Workspace
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline indicator if disconnected */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline {offlineQueue.length > 0 && `(${offlineQueue.length} queued)`}</span>
            </div>
          )}

          {/* Daily Review Quick Link */}
          <button
            onClick={() => navigate('/review')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="End of Day Review"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Review Day</span>
          </button>

          {/* Theme switch (visible on mobile too) */}
          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Add Button (Desktop & Tablet) */}
          <button
            onClick={onQuickAdd}
            className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
