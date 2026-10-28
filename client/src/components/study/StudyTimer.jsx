import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles, BookOpen, Code2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SUBJECTS = [
  { name: 'DSA', domain: 'technical', label: 'DSA (LeetCode & Striver)' },
  { name: 'Java', domain: 'technical', label: 'Core Java & Multithreading' },
  { name: 'MERN Stack', domain: 'technical', label: 'MERN Stack Projects' },
  { name: 'SQL and DBMS', domain: 'technical', label: 'SQL & DBMS Concepts' },
  { name: 'Technical Interview Prep', domain: 'technical', label: 'Tech Interview Preparation' },
  { name: 'SSC CGL Quantitative Aptitude', domain: 'government', label: 'SSC CGL Quant' },
  { name: 'SSC CGL Reasoning', domain: 'government', label: 'SSC CGL Reasoning' },
  { name: 'SSC CGL English', domain: 'government', label: 'SSC CGL English' },
  { name: 'SSC CGL General Awareness', domain: 'government', label: 'SSC CGL GA / Current Affairs' },
];

export const StudyTimer = ({ onSessionSaved }) => {
  const [selectedSubject, setSelectedSubject] = useState(PRESET_SUBJECTS[0].name);
  const [selectedDomain, setSelectedDomain] = useState(PRESET_SUBJECTS[0].domain);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectText, setCustomSubjectText] = useState('');

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleFinish = async () => {
    if (seconds < 60) {
      alert('Session should be at least 1 minute long to log.');
      return;
    }

    setIsSaving(true);
    const subjectName = isCustomSubject ? customSubjectText.trim() : selectedSubject;
    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    try {
      await onSessionSaved({
        subject: subjectName || 'General Study',
        domain: selectedDomain,
        durationMinutes,
        notes
      });

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {}

      setIsActive(false);
      setSeconds(0);
      setNotes('');
    } catch (err) {
      console.error('Failed to save study session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSubject = (item) => {
    setSelectedSubject(item.name);
    setSelectedDomain(item.domain);
    setIsCustomSubject(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-xl mx-auto">
      {/* Domain badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            selectedDomain === 'technical'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
          }`}
        >
          {selectedDomain === 'technical' ? (
            <Code2 className="w-3.5 h-3.5" />
          ) : (
            <BookOpen className="w-3.5 h-3.5" />
          )}
          <span>{selectedDomain} track</span>
        </span>
      </div>

      {/* Timer Clock Display */}
      <div className="text-center my-6">
        <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono select-none">
          {formatTimer(seconds)}
        </div>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {isActive ? 'Session in progress...' : seconds > 0 ? 'Timer paused' : 'Ready to focus'}
        </p>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-95 ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
          }`}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isActive ? 'Pause' : seconds > 0 ? 'Resume' : 'Start Focus'}</span>
        </button>

        {seconds > 0 && (
          <>
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? 'Logging...' : 'Finish & Log'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Subject Selector */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Subject
          </label>
          <button
            type="button"
            onClick={() => setIsCustomSubject(!isCustomSubject)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isCustomSubject ? 'Pick from presets' : '+ Custom subject'}
          </button>
        </div>

        {isCustomSubject ? (
          <div className="space-y-2">
            <input
              type="text"
              value={customSubjectText}
              onChange={(e) => setCustomSubjectText(e.target.value)}
              placeholder="e.g. System Design, Indian History, Operating Systems..."
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedDomain('technical')}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${
                  selectedDomain === 'technical'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Technical
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain('government')}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${
                  selectedDomain === 'government'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Govt Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {PRESET_SUBJECTS.map((item) => {
              const isSelected = selectedSubject === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectSubject(item)}
                  className={`text-left text-xs p-2 rounded-xl border truncate transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.domain === 'technical' ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Optional notes */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Session Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Solved 3 graph questions, finished SSC algebra set..."
            className="w-full mt-1 text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
