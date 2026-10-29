import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckSquare,
  Flame,
  BarChart3,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/', label: 'Tasks', icon: CheckSquare },
    { to: '/habits', label: 'Habits', icon: Flame },
    { to: '/progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
          D
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">DayTrack</h1>
          <p className="text-[11px] text-slate-400 font-medium">Daily Productivity</p>
        </div>
      </div>

      {/* Exactly 3 Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0 stroke-[2.2]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile & controls */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
            {user?.name}
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
