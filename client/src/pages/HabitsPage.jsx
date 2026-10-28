import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Flame, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitHeatmapGrid } from '../components/habits/HabitHeatmapGrid';
import { HabitModal } from '../components/habits/HabitModal';
import { habitApi } from '../api/habitApi';
import { getTodayString } from '../utils/dateUtils';

const DEFAULT_HABIT_SUGGESTIONS = [
  'Morning Gym / Workout',
  '30 mins Daily DSA',
  '1 Hour Technical Study (Java/MERN)',
  'Drink 3 Litres of Water',
  'Eat Planned Healthy Meals',
  'Plan Tomorrow in DayTrack'
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
        // Refresh heatmap data
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-emerald-500 fill-emerald-500" />
            <span>Habits & Daily Consistency</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distinct from one-off tasks. Build non-negotiable routines and monitor streaks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Heatmap Grid */}
      <HabitHeatmapGrid dateCounts={heatmapData} days={60} />

      {/* Habit Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Habits ({habits.filter((h) => h.isCompletedToday).length}/{habits.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <Flame className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-70" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active habits yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Choose one or two core daily habits to build solid discipline alongside your job:
            </p>

            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto mt-4">
              {DEFAULT_HABIT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleAddDefaultSuggestion(sug)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 hover:bg-emerald-100 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
