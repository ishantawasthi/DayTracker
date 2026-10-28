import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Quote, CheckCircle } from 'lucide-react';
import { formatFullDate, getGreeting, getRandomQuote } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export const MotivationCard = ({ onPlanTomorrowClick }) => {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-700/30">
      {/* Subtle decorative circles */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            <span>{formatFullDate()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {getGreeting(user?.name || 'Explorer')}
          </h2>

          <div className="flex items-start gap-2 mt-2.5 max-w-xl text-indigo-100/90 text-xs sm:text-sm italic">
            <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>"{quote}"</span>
          </div>
        </div>

        {onPlanTomorrowClick && (
          <button
            onClick={onPlanTomorrowClick}
            className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Plan Tomorrow</span>
          </button>
        )}
      </div>
    </div>
  );
};
