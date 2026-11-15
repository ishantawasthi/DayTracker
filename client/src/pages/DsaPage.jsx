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
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dsaApi } from '../api/dsaApi';
import { AddQuestionModal } from '../components/dsa/AddQuestionModal';

export const DsaPage = () => {
  const [questions, setQuestions] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All'); // All | Easy | Medium | Hard
  const [statusFilter, setStatusFilter] = useState('All'); // All | Solved | Unsolved
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Accordion state
  const [collapsedTopics, setCollapsedTopics] = useState(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDsaData = async () => {
    try {
      setLoading(true);
      const res = await dsaApi.getQuestions();
      if (res.success) {
        setQuestions(res.data.questions || []);
        setCompletedIds(new Set(res.data.completedIds || []));
        setStats(res.data.stats || null);
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
      // Revert on error
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

  // Group all questions by topic
  const allTopics = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => set.add(q.topic));
    return Array.from(set);
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!q.title.toLowerCase().includes(query) && !q.topic.toLowerCase().includes(query)) {
          return false;
        }
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

  const toggleTopicCollapse = (topicName) => {
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicName)) next.delete(topicName);
      else next.add(topicName);
      return next;
    });
  };

  const handleExpandAll = () => setCollapsedTopics(new Set());
  const handleCollapseAll = () => setCollapsedTopics(new Set(allTopics));

  // Compute live counts
  const totalQuestionsCount = questions.length;
  const totalSolvedCount = questions.filter((q) => completedIds.has(q._id)).length;
  const overallPercentage =
    totalQuestionsCount === 0 ? 0 : Math.round((totalSolvedCount / totalQuestionsCount) * 100);

  const easySolved = questions.filter((q) => q.difficulty === 'Easy' && completedIds.has(q._id)).length;
  const easyTotal = questions.filter((q) => q.difficulty === 'Easy').length;

  const mediumSolved = questions.filter((q) => q.difficulty === 'Medium' && completedIds.has(q._id)).length;
  const mediumTotal = questions.filter((q) => q.difficulty === 'Medium').length;

  const hardSolved = questions.filter((q) => q.difficulty === 'Hard' && completedIds.has(q._id)).length;
  const hardTotal = questions.filter((q) => q.difficulty === 'Hard').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* 1. Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Striver A2Z DSA Sheet
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master 200+ core Data Structures & Algorithms topic-by-topic.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Question</span>
        </button>
      </div>

      {/* 2. Progress Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Overall Progress</span>
            <span className="text-xs font-semibold text-slate-400">
              ({totalSolvedCount} / {totalQuestionsCount} Solved)
            </span>
          </div>
          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
            {overallPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        {/* Difficulty Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Easy
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {easySolved} / {easyTotal}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Medium
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {mediumSolved} / {mediumTotal}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Hard
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {hardSolved} / {hardTotal}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem title or topic..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  difficultyFilter === diff
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {['All', 'Solved', 'Unsolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Topic dropdown + Expand/Collapse All */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate focus:outline-none"
            >
              <option value="All">All Topics ({allTopics.length})</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
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

      {/* 4. Questions Grouped by Topic */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading DSA Sheet...</div>
      ) : Object.keys(groupedQuestions).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70 mb-1" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No questions match your filter</p>
          <p className="text-xs text-slate-400">Try adjusting your search query, difficulty, or topic filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedQuestions).map(([topicName, qList]) => {
            const isCollapsed = collapsedTopics.has(topicName);
            const topicSolved = qList.filter((q) => completedIds.has(q._id)).length;
            const topicTotal = qList.length;
            const topicPercent = topicTotal === 0 ? 0 : Math.round((topicSolved / topicTotal) * 100);

            return (
              <div
                key={topicName}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs"
              >
                {/* Topic Header Accordion Button */}
                <button
                  type="button"
                  onClick={() => toggleTopicCollapse(topicName)}
                  className="w-full flex items-center justify-between p-3.5 sm:px-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {topicName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                      {topicSolved}/{topicTotal}
                    </span>
                  </div>

                  {/* Topic Progress bar */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="w-16 sm:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                        style={{ width: `${topicPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                      {topicPercent}%
                    </span>
                  </div>
                </button>

                {/* Question List */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                    {qList.map((q, index) => {
                      const isDone = completedIds.has(q._id);

                      return (
                        <div
                          key={q._id}
                          className={`flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 transition-colors ${
                            isDone
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Checkbox + Title */}
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                            onClick={() => handleToggle(q._id)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(q._id);
                              }}
                              className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
                              }`}
                              aria-label={isDone ? 'Mark unsolved' : 'Mark solved'}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              {q.number > 0 && (
                                <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 w-8 flex-shrink-0">
                                  #{q.number}
                                </span>
                              )}
                              <span
                                className={`text-xs sm:text-sm font-medium truncate ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {q.title}
                              </span>
                              {q.pattern && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hidden md:inline-block border border-slate-200/50 dark:border-slate-700/50">
                                  {q.pattern}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Difficulty Badge + Practice Link + Delete (if custom) */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Difficulty */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : q.difficulty === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            {/* Practice Link */}
                            <a
                              href={q.problemUrl || `https://leetcode.com/problemset/?search=${encodeURIComponent(q.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Practice on LeetCode / External"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Custom Question Delete Button */}
                            {q.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q._id)}
                                title="Delete Custom Question"
                                className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

