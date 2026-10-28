import React from 'react';
import { Clock, Trash2, Code2, BookOpen } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

export const StudySessionHistory = ({ sessions = [], onDeleteSession }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No study sessions recorded yet today. Start the timer above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        Recent Logged Sessions
      </h3>

      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  s.domain === 'technical'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {s.domain === 'technical' ? (
                  <Code2 className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {s.subject}
                </div>
                <div className="text-[11px] text-slate-400">
                  {formatDisplayDate(s.date)} • {s.durationMinutes} mins
                  {s.notes && <span className="ml-1 text-slate-500">— {s.notes}</span>}
                </div>
              </div>
            </div>

            {onDeleteSession && (
              <button
                onClick={() => onDeleteSession(s._id)}
                className="text-slate-300 hover:text-rose-500 p-1"
                title="Delete session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
