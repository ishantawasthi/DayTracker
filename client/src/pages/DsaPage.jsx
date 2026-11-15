import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Search,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronRight,
  Code2,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dsaApi } from '../api/dsaApi';
import { AddQuestionModal } from '../components/dsa/AddQuestionModal';

export const DsaPage = () => {
  const [questions, setQuestions] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All'); // All | Easy | Medium | Hard
  const [statusFilter, setStatusFilter] = useState('All'); // All | Solved | Unsolved
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Accordion state: by default, NO topics are expanded (all collapsed as requested)
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDsaData = async () => {
    try {
      setLoading(true);
      const res = await dsaApi.getQuestions();
      if (res.success) {
        setQuestions(res.data.questions || []);
        setCompletedIds(new Set(res.data.completedIds || []));
      }
    } catch (err) {
      console.error('Failed to load DSA questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDsaData();
  }, []);

  // Toggle completion
  const handleToggle = async (questionId) => {
    const isCurrentlyDone = completedIds.has(questionId);

    // Optimistic UI update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyDone) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    if (!isCurrentlyDone) {
      try {
        confetti({
          particleCount: 22,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b']
        });
      } catch (e) {}
    }

    try {
      const res = await dsaApi.toggleQuestion(questionId);
      if (res.success) {
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (res.isCompleted) next.add(questionId);
          else next.delete(questionId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle question:', err);
      fetchDsaData();
    }
  };

  const handleAddQuestion = async (newQ) => {
    const res = await dsaApi.addQuestion(newQ);
    if (res.success) {
      fetchDsaData();
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this custom question?')) return;
    try {
      const res = await dsaApi.deleteQuestion(questionId);
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Group all questions by topic preserving appearance order
  const allTopics = useMemo(() => {
    const seen = new Set();
    const list = [];
    questions.forEach((q) => {
      if (!seen.has(q.topic)) {
        seen.add(q.topic);
        list.push(q.topic);
      }
    });
    return list;
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchPattern = q.pattern && q.pattern.toLowerCase().includes(query);
        if (!matchTitle && !matchTopic && !matchPattern) return false;
      }
      // Topic filter
      if (selectedTopic !== 'All' && q.topic !== selectedTopic) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }
      // Status filter
      const isDone = completedIds.has(q._id);
      if (statusFilter === 'Solved' && !isDone) return false;
      if (statusFilter === 'Unsolved' && isDone) return false;

      return true;
    });
  }, [questions, searchQuery, selectedTopic, difficultyFilter, statusFilter, completedIds]);

  // Group filtered questions by topic
  const groupedQuestions = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach((q) => {
      if (!groups[q.topic]) groups[q.topic] = [];
      groups[q.topic].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  // Toggle single topic collapse/expand
  const toggleTopic = (topicName) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicName)) next.delete(topicName);
      else next.add(topicName);
      return next;
    });
  };

  const handleExpandAll = () => setExpandedTopics(new Set(allTopics));
  const handleCollapseAll = () => setExpandedTopics(new Set());

  // Compute live stats
  const totalCount = questions.length;
  const solvedCount = questions.filter((q) => completedIds.has(q._id)).length;
  const percentage = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  const easySolved = questions.filter((q) => q.difficulty === 'Easy' && completedIds.has(q._id)).length;
  const easyTotal = questions.filter((q) => q.difficulty === 'Easy').length;

  const medSolved = questions.filter((q) => q.difficulty === 'Medium' && completedIds.has(q._id)).length;
  const medTotal = questions.filter((q) => q.difficulty === 'Medium').length;

  const hardSolved = questions.filter((q) => q.difficulty === 'Hard' && completedIds.has(q._id)).length;
  const hardTotal = questions.filter((q) => q.difficulty === 'Hard').length;

  // If user enters search query, automatically show matching results
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-3 animate-fade-in max-w-4xl mx-auto pb-14 px-1 sm:px-0">
      {/* 1. Compact Unified Mobile & Desktop Dashboard Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2.5">
        {/* Row 1: Title, Solved Ratio & Add Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Striver A2Z DSA Sheet
              </h1>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                {solvedCount}/{totalCount} ({percentage}%)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Row 2: Slim Progress Line */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Row 3: Compact Difficulty Breakdown Pills */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold flex-wrap">
          <div className="flex-1 min-w-[90px] py-1 px-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
            <span>{easySolved}/{easyTotal}</span>
          </div>
          <div className="flex-1 min-w-[90px] py-1 px-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Medium</span>
            <span>{medSolved}/{medTotal}</span>
          </div>
          <div className="flex-1 min-w-[90px] py-1 px-2 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Hard</span>
            <span>{hardSolved}/{hardTotal}</span>
          </div>
        </div>

        {/* Row 4: Search & Filters in one compact block */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem title, pattern, or topic..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips (Horizontal scroll on mobile) */}
          <div className="flex items-center justify-between gap-1 text-[11px] overflow-x-auto no-scrollbar pb-0.5">
            <div className="flex items-center gap-1 flex-shrink-0">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    difficultyFilter === diff
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {['All', 'Solved', 'Unsolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Expand / Collapse All control */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
            <span>{allTopics.length} Topics • {totalCount} Questions</span>
            <div className="flex items-center gap-2 font-medium">
              <button
                onClick={handleExpandAll}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={handleCollapseAll}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Questions Grouped by Topic Accordion (Collapsed by default) */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading Striver DSA Sheet...</div>
      ) : Object.keys(groupedQuestions).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-1">
          <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto opacity-70 mb-1" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No questions found</p>
          <p className="text-[11px] text-slate-400">Try clearing your search or status filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedQuestions).map(([topicName, qList]) => {
            // If searching, auto-expand; otherwise obey expandedTopics state
            const isOpen = isSearching || expandedTopics.has(topicName);
            const topicSolved = qList.filter((q) => completedIds.has(q._id)).length;
            const topicTotal = qList.length;
            const topicPercent = topicTotal === 0 ? 0 : Math.round((topicSolved / topicTotal) * 100);

            return (
              <div
                key={topicName}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-all"
              >
                {/* Topic Header Accordion Button (Looks exactly like user's screenshot when collapsed) */}
                <button
                  type="button"
                  onClick={() => toggleTopic(topicName)}
                  className="w-full flex items-center justify-between p-3 sm:px-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {topicName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                      {topicSolved}/{topicTotal}
                    </span>
                  </div>

                  {/* Progress bar on the right */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="w-14 sm:w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                        style={{ width: `${topicPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 w-7 text-right">
                      {topicPercent}%
                    </span>
                  </div>
                </button>

                {/* Question List when expanded */}
                {isOpen && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border-t border-slate-100 dark:border-slate-800">
                    {qList.map((q) => {
                      const isDone = completedIds.has(q._id);
                      // Use Striver / TakeUforward link
                      const striverUrl =
                        q.problemUrl && q.problemUrl.includes('takeuforward.org')
                          ? q.problemUrl
                          : `https://takeuforward.org/?s=${encodeURIComponent(q.title)}`;

                      return (
                        <div
                          key={q._id}
                          className={`flex items-start justify-between gap-2.5 px-3 sm:px-4 py-2.5 transition-colors ${
                            isDone
                              ? 'bg-emerald-50/15 dark:bg-emerald-950/10'
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Left: Checkbox + Title + Pattern (Visible on mobile) */}
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggle(q._id)}
                              className={`flex-shrink-0 w-4.5 h-4.5 mt-0.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
                              }`}
                              aria-label={isDone ? 'Mark unsolved' : 'Mark solved'}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                {q.number > 0 && (
                                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                    #{q.number}
                                  </span>
                                )}
                                <span
                                  className={`text-xs font-semibold leading-snug ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {q.title}
                                </span>
                              </div>

                              {/* Pattern / Technique: PROMINENTLY VISIBLE ON MOBILE */}
                              {q.pattern && (
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-200/50 dark:border-indigo-800/40">
                                    Pattern: {q.pattern}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Difficulty Badge + Striver Sheet Link */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                            {/* Difficulty */}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : q.difficulty === 'Medium'
                                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            {/* Striver Sheet Question Link */}
                            <a
                              href={striverUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open on Striver Sheet (TakeUforward)"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/40 transition-colors"
                            >
                              <span className="hidden sm:inline">Striver</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            {/* Delete custom question */}
                            {q.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q._id)}
                                title="Delete Custom Question"
                                className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Question Modal */}
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddQuestion}
        existingTopics={allTopics}
      />
    </div>
  );
};
