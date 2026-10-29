import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, Flame, BarChart3, Moon, Sun, LogOut } from 'lucide-react';
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
    <aside className="hidden md:flex flex-col w-52 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 p-4 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 py-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
          D
        </div>
        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">DayTrack</span>
      </div>

      {/* Only 3 Navigation Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {user?.name?.split(' ')[0]}
          </span>
          <button
            onClick={toggleTheme}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
