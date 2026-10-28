import React, { useState, useEffect } from 'react';
import { Calendar, Quote, Sparkles } from 'lucide-react';
import { formatFullDate, getGreeting, getRandomQuote } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export const MotivationCard = ({ onPlanTomorrowClick }) => {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
            <Calendar className="w-3 h-3" />
            <span>{formatFullDate()}</span>
          </div>

          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {getGreeting(user?.name?.split(' ')[0] || 'Friend')}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2 sm:line-clamp-none">
            "{quote}"
          </p>
        </div>

        {onPlanTomorrowClick && (
          <button
            onClick={onPlanTomorrowClick}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/40 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Plan Tomorrow</span>
          </button>
        )}
      </div>
    </div>
  );
};
