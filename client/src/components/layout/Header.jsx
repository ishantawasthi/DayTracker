import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, WifiOff, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

export const Header = ({ onQuickAdd }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, offlineQueue } = useSync();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-3.5 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Mobile Header Brand & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
              DayTrack
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Personal OS'}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline alert pill if offline */}
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
              <WifiOff className="w-3 h-3" />
              <span>Offline {offlineQueue.length > 0 && `(${offlineQueue.length})`}</span>
            </div>
          )}

          {/* Quick Review Link */}
          <button
            onClick={() => navigate('/review')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Daily Review"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Review</span>
          </button>

          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop Quick Add Button */}
          <button
            onClick={onQuickAdd}
            className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
