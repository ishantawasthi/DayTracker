import React from 'react';
import { Plus, Moon, Sun, WifiOff, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

export const Header = ({ onQuickAdd }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, offlineQueue } = useSync();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-2.5 sm:py-3 transition-colors">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
              DayTrack
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Tasks & Habits'}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
              <WifiOff className="w-3 h-3" />
              <span>Offline ({offlineQueue.length})</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Sign out on mobile header */}
          <button
            onClick={logout}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const inlineInput = document.getElementById('task-input');
              if (inlineInput) {
                inlineInput.focus();
              } else if (onQuickAdd) {
                onQuickAdd();
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
