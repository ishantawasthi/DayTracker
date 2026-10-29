import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, Flame, BarChart3 } from 'lucide-react';

export const MobileBottomNav = () => {
  const navItems = [
    { to: '/', label: 'Tasks', icon: CheckSquare },
    { to: '/habits', label: 'Habits', icon: Flame },
    { to: '/progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/70 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
