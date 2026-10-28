import React, { useState, useEffect } from 'react';
import { Timer, Code2, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { StudyTimer } from '../components/study/StudyTimer';
import { StudySessionHistory } from '../components/study/StudySessionHistory';
import { studyApi } from '../api/studyApi';
import { getTodayString } from '../utils/dateUtils';

export const StudyPage = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudyData = async () => {
    try {
      const todayStr = getTodayString();
      const [statsRes, sessionsRes] = await Promise.all([
        studyApi.getStats(todayStr),
        studyApi.getSessions({ limit: 15 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (sessionsRes.success) setRecentSessions(sessionsRes.data);
    } catch (err) {
      console.error('Failed to load study data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  const handleSessionSaved = async (sessionData) => {
    await studyApi.logSession(sessionData);
    fetchStudyData();
  };

  const handleDeleteSession = async (id) => {
    try {
      await studyApi.deleteSession(id);
      fetchStudyData();
    } catch (err) {
      console.error(err);
    }
  };

  const today = stats?.today || { totalMinutes: 0, technicalMinutes: 0, governmentMinutes: 0 };
  const weekly = stats?.weekly || { totalMinutes: 0, technicalMinutes: 0, governmentMinutes: 0 };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Timer className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Focused Study Session Tracker</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dedicated stopwatch & subject timer. Track honest study minutes for tech career & govt exams.
        </p>
      </div>

      {/* Summary Cards: Today vs Weekly, Tech vs Govt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today Studied
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {today.totalMinutes}m
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {Math.floor(today.totalMinutes / 60)}h {today.totalMinutes % 60}m
          </div>
        </div>

        {/* Today Tech vs Govt */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today Breakdown
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Tech: {today.technicalMinutes}m
            </span>
          </div>
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            Govt: {today.governmentMinutes}m
          </div>
        </div>

        {/* Weekly Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            This Week Total
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {(weekly.totalMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {weekly.totalMinutes} recorded mins
          </div>
        </div>

        {/* Weekly Tech vs Govt */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Weekly Ratio
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
            💻 {(weekly.technicalMinutes / 60).toFixed(1)}h Tech
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            📚 {(weekly.governmentMinutes / 60).toFixed(1)}h Govt
          </div>
        </div>
      </div>

      {/* Stopwatch Timer Component */}
      <StudyTimer onSessionSaved={handleSessionSaved} />

      {/* History Log */}
      <StudySessionHistory
        sessions={recentSessions}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
};
