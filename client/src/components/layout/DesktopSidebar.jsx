import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Timer,
  BarChart3,
  Moon,
  Sun,
  Settings,
  LogOut,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/habits', label: 'Habits', icon: Flame },
    { to: '/study', label: 'Study Tracker', icon: Timer },
    { to: '/progress', label: 'Progress & Growth', icon: BarChart3 },
    { to: '/review', label: 'Daily Review', icon: CalendarCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">DayTrack</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Life & Growth OS</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Routine schedule badge */}
      <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Schedule Profile
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Job: 10:00 AM – 07:00 PM
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
          Morning & Evening growth blocks
        </p>
      </div>

      {/* Bottom Profile & Theme toggle */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
