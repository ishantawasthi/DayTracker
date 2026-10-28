import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Flame, Plus } from 'lucide-react';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitHeatmapGrid } from '../components/habits/HabitHeatmapGrid';
import { HabitModal } from '../components/habits/HabitModal';
import { habitApi } from '../api/habitApi';
import { getTodayString } from '../utils/dateUtils';

const DEFAULT_HABIT_SUGGESTIONS = [
  'Morning Gym / Workout',
  '30m Daily DSA',
  '1h Core Java',
  'Drink 3L Water',
  'Plan Tomorrow'
];

export const HabitsPage = () => {
  const { categories } = useOutletContext();
  const [habits, setHabits] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const todayStr = getTodayString();
      const [habitsRes, heatmapRes] = await Promise.all([
        habitApi.getHabits(todayStr),
        habitApi.getHeatmap(60)
      ]);

      if (habitsRes.success) setHabits(habitsRes.data);
      if (heatmapRes.success) setHeatmapData(heatmapRes.data.dateCounts || {});
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      const todayStr = getTodayString();
      const res = await habitApi.toggleHabitDate(habitId, todayStr);
      if (res.success) {
        setHabits((prev) =>
          prev.map((h) => (h._id === habitId ? res.data : h))
        );
        const hm = await habitApi.getHeatmap(60);
        if (hm.success) setHeatmapData(hm.data.dateCounts || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (habitData) => {
    const res = await habitApi.createHabit(habitData);
    if (res.success) {
      setHabits((prev) => [...prev, res.data]);
    }
    return res;
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await habitApi.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDefaultSuggestion = async (title) => {
    try {
      await handleCreateHabit({ title, targetFrequency: 'daily' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            <span>Habits & Consistency</span>
          </h1>
          <p className="text-[11px] text-slate-400">
            Daily routines and streak progress
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Heatmap Grid */}
      <HabitHeatmapGrid dateCounts={heatmapData} days={60} />

      {/* Habit Cards */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Today's Habits ({habits.filter((h) => h.isCompletedToday).length}/{habits.length})
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center">
            <Flame className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-70" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active habits yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap a preset to start tracking daily consistency:
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center max-w-sm mx-auto mt-3">
              {DEFAULT_HABIT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleAddDefaultSuggestion(sug)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 hover:bg-emerald-100 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggleDate={handleToggleHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habit Create Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onHabitCreated={handleCreateHabit}
        categories={categories}
      />
    </div>
  );
};
