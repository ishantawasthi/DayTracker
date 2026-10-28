import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, BookOpen, Code2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SUBJECTS = [
  { name: 'DSA', domain: 'technical', label: 'DSA Practice' },
  { name: 'Java', domain: 'technical', label: 'Core Java' },
  { name: 'MERN Stack', domain: 'technical', label: 'MERN Project' },
  { name: 'SQL and DBMS', domain: 'technical', label: 'SQL & DBMS' },
  { name: 'Technical Interview Prep', domain: 'technical', label: 'Tech Interview' },
  { name: 'SSC CGL Quantitative Aptitude', domain: 'government', label: 'SSC CGL Quant' },
  { name: 'SSC CGL Reasoning', domain: 'government', label: 'SSC Reasoning' },
  { name: 'SSC CGL English', domain: 'government', label: 'SSC English' },
  { name: 'SSC CGL General Awareness', domain: 'government', label: 'SSC GA / GK' },
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

  const toggleTimer = () => setIsActive(!isActive);

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
          particleCount: 30,
          spread: 50,
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs max-w-lg mx-auto">
      {/* Domain badge */}
      <div className="flex items-center justify-center mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            selectedDomain === 'technical'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50'
          }`}
        >
          {selectedDomain === 'technical' ? <Code2 className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
          <span>{selectedDomain} Track</span>
        </span>
      </div>

      {/* Clock display */}
      <div className="text-center my-4 sm:my-6">
        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono select-none">
          {formatTimer(seconds)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
          {isActive ? 'Timer running...' : seconds > 0 ? 'Paused' : 'Ready to study'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-5">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all active:scale-95 ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isActive ? 'Pause' : seconds > 0 ? 'Resume' : 'Start Focus'}</span>
        </button>

        {seconds > 0 && (
          <>
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSaving ? 'Logging...' : 'Finish'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Subject Picker */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Subject
          </span>
          <button
            type="button"
            onClick={() => setIsCustomSubject(!isCustomSubject)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isCustomSubject ? 'Presets' : '+ Custom'}
          </button>
        </div>

        {isCustomSubject ? (
          <div className="space-y-1.5">
            <input
              type="text"
              value={customSubjectText}
              onChange={(e) => setCustomSubjectText(e.target.value)}
              placeholder="e.g. System Design, Aptitude..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedDomain('technical')}
                className={`flex-1 py-1 text-xs rounded-lg border font-medium ${
                  selectedDomain === 'technical' ? 'bg-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                Technical
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain('government')}
                className={`flex-1 py-1 text-xs rounded-lg border font-medium ${
                  selectedDomain === 'government' ? 'bg-amber-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                Govt Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_SUBJECTS.map((item) => {
              const isSelected = selectedSubject === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectSubject(item)}
                  className={`px-2.5 py-1 text-xs rounded-lg border whitespace-nowrap transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Note input */}
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes (optional)..."
          className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};
