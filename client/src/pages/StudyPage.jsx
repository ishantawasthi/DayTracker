import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
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
        studyApi.getSessions({ limit: 10 })
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
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Focused Study Session</span>
        </h1>
        <p className="text-[11px] text-slate-400">
          Stopwatch timer for tech career & government exams
        </p>
      </div>

      {/* Lean 2-col Stats Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Today Studied
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {today.totalMinutes}m
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{today.technicalMinutes}m Tech</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{today.governmentMinutes}m Govt</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            This Week
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {(weekly.totalMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {weekly.totalMinutes} recorded mins
          </div>
        </div>
      </div>

      {/* Stopwatch Component */}
      <StudyTimer onSessionSaved={handleSessionSaved} />

      {/* History */}
      <StudySessionHistory
        sessions={recentSessions}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
};
