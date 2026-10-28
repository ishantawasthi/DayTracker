import express from 'express';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

const formatDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to recalculate streaks
const calculateStreak = async (userId, habitId) => {
  const completions = await HabitCompletion.find({ user: userId, habit: habitId }).sort({ date: -1 });
  if (completions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const completedDates = new Set(completions.map((c) => c.date));
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // Check if current streak is active (completed today or yesterday)
  let currentStreak = 0;
  let checkDate = completedDates.has(todayStr) ? new Date(today) : new Date(yesterday);

  if (completedDates.has(todayStr) || completedDates.has(yesterdayStr)) {
    while (true) {
      const dStr = formatDate(checkDate);
      if (completedDates.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all completions
  const sortedDates = Array.from(completedDates).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const cur = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = cur.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = cur;
  }

  return { currentStreak, longestStreak };
};

// @route   GET /api/habits
// @desc    Get all habits with completion status for requested date
router.get('/', async (req, res) => {
  try {
    const targetDate = req.query.date || formatDate(new Date());
    const habits = await Habit.find({ user: req.user._id, isActive: true })
      .populate('category', 'name color icon')
      .sort({ createdAt: 1 });

    const completionsToday = await HabitCompletion.find({
      user: req.user._id,
      date: targetDate
    });

    const completedHabitIds = new Set(completionsToday.map((c) => c.habit.toString()));

    const habitsWithStatus = habits.map((habit) => {
      const obj = habit.toObject();
      obj.isCompletedToday = completedHabitIds.has(habit._id.toString());
      return obj;
    });

    res.json({ success: true, count: habitsWithStatus.length, data: habitsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
router.post('/', async (req, res) => {
  try {
    const { title, category, targetFrequency, icon, color } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      user: req.user._id,
      title: title.trim(),
      category: category || null,
      targetFrequency: targetFrequency || 'daily',
      icon: icon || 'Flame',
      color: color || '#10B981'
    });

    const populated = await Habit.findById(habit._id).populate('category', 'name color icon');
    res.status(201).json({ success: true, data: { ...populated.toObject(), isCompletedToday: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/habits/:id/toggle-date
// @desc    Toggle habit completion for a specific date
router.patch('/:id/toggle-date', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || formatDate(new Date());

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const existingCompletion = await HabitCompletion.findOne({
      user: req.user._id,
      habit: habit._id,
      date: targetDate
    });

    let completed = false;
    if (existingCompletion) {
      await existingCompletion.deleteOne();
      completed = false;
    } else {
      await HabitCompletion.create({
        user: req.user._id,
        habit: habit._id,
        date: targetDate
      });
      completed = true;
    }

    // Recalculate streaks
    const { currentStreak, longestStreak } = await calculateStreak(req.user._id, habit._id);
    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, longestStreak);
    await habit.save();

    const populated = await Habit.findById(habit._id).populate('category', 'name color icon');
    res.json({
      success: true,
      data: {
        ...populated.toObject(),
        isCompletedToday: completed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/habits/heatmap
// @desc    Get habit completion log for the last N days (for calendar heatmap)
router.get('/heatmap', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 60;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = formatDate(startDate);

    const completions = await HabitCompletion.find({
      user: req.user._id,
      date: { $gte: startDateStr }
    }).populate('habit', 'title color icon');

    // Group completions by date
    const dateCounts = {};
    completions.forEach((c) => {
      dateCounts[c.date] = (dateCounts[c.date] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        completions,
        dateCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit and its completions
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    await HabitCompletion.deleteMany({ habit: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Habit deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
