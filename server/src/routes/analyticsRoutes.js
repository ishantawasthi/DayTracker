import express from 'express';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import StudySession from '../models/StudySession.js';
import Category from '../models/Category.js';
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

// @route   GET /api/analytics/overview
// @desc    Consolidated personal growth analytics
router.get('/overview', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = Math.min(parseInt(days) || 30, 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (numDays - 1));
    const startDateStr = formatDate(startDate);
    const todayStr = formatDate(new Date());

    // 1. Fetch tasks in date range
    const tasks = await Task.find({
      user: req.user._id,
      scheduledDate: { $gte: startDateStr, $lte: todayStr }
    }).populate('category', 'name color icon');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const totalCompletedCount = completedTasks.length;
    const overallCompletionRate = totalTasks === 0 ? 0 : Math.round((totalCompletedCount / totalTasks) * 100);

    // 2. Category-wise breakdown
    const categoryStats = {};
    tasks.forEach((t) => {
      const catName = t.category?.name || 'Uncategorized';
      const catColor = t.category?.color || '#94A3B8';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { name: catName, color: catColor, total: 0, completed: 0 };
      }
      categoryStats[catName].total += 1;
      if (t.status === 'completed') {
        categoryStats[catName].completed += 1;
      }
    });

    const categoryBreakdown = Object.values(categoryStats).map((cat) => ({
      ...cat,
      rate: cat.total === 0 ? 0 : Math.round((cat.completed / cat.total) * 100)
    }));

    // 3. Day-by-day Task Completion Trend
    const dayWiseTrend = [];
    const dateMap = {};

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      dateMap[dStr] = {
        date: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        studyMinutes: 0,
        technicalMinutes: 0,
        governmentMinutes: 0,
        habitsCompleted: 0,
        activityScore: 0 // Used for heatmap intensity
      };
    }

    tasks.forEach((t) => {
      if (dateMap[t.scheduledDate]) {
        dateMap[t.scheduledDate].totalTasks += 1;
        if (t.status === 'completed') {
          dateMap[t.scheduledDate].completedTasks += 1;
        }
      }
    });

    // 4. Study Sessions in range
    const studySessions = await StudySession.find({
      user: req.user._id,
      date: { $gte: startDateStr, $lte: todayStr }
    });

    let totalTechStudyMinutes = 0;
    let totalGovtStudyMinutes = 0;

    studySessions.forEach((s) => {
      if (dateMap[s.date]) {
        dateMap[s.date].studyMinutes += s.durationMinutes;
        if (s.domain === 'technical') {
          dateMap[s.date].technicalMinutes += s.durationMinutes;
          totalTechStudyMinutes += s.durationMinutes;
        } else if (s.domain === 'government') {
          dateMap[s.date].governmentMinutes += s.durationMinutes;
          totalGovtStudyMinutes += s.durationMinutes;
        }
      }
    });

    // 5. Habits & Completions
    const habits = await Habit.find({ user: req.user._id, isActive: true });
    const habitCompletions = await HabitCompletion.find({
      user: req.user._id,
      date: { $gte: startDateStr, $lte: todayStr }
    });

    habitCompletions.forEach((hc) => {
      if (dateMap[hc.date]) {
        dateMap[hc.date].habitsCompleted += 1;
      }
    });

    // 6. Gym & Workout Consistency count
    // Look for completed tasks in "Fitness" category or habits named "Gym" / "Workout"
    const fitnessCompletedTasks = completedTasks.filter((t) =>
      t.category?.name?.toLowerCase().includes('fitness') || t.title.toLowerCase().includes('gym')
    ).length;

    // Build array and calculate rates & activity score (0 - 4 scale for GitHub-like heatmap)
    Object.keys(dateMap).sort().forEach((dStr) => {
      const item = dateMap[dStr];
      item.completionRate = item.totalTasks === 0 ? 0 : Math.round((item.completedTasks / item.totalTasks) * 100);

      // Score formula: completed tasks (1 pt each) + 30m study block (1 pt each) + habits (1 pt each)
      const rawPoints = item.completedTasks + Math.floor(item.studyMinutes / 30) + item.habitsCompleted;
      let level = 0;
      if (rawPoints >= 6) level = 4;
      else if (rawPoints >= 4) level = 3;
      else if (rawPoints >= 2) level = 2;
      else if (rawPoints >= 1) level = 1;

      item.activityScore = level;
      dayWiseTrend.push(item);
    });

    res.json({
      success: true,
      data: {
        rangeDays: numDays,
        summary: {
          totalTasks,
          totalCompletedCount,
          overallCompletionRate,
          totalTechStudyMinutes,
          totalGovtStudyMinutes,
          totalStudyHours: ((totalTechStudyMinutes + totalGovtStudyMinutes) / 60).toFixed(1),
          fitnessSessionsCount: fitnessCompletedTasks,
          activeHabitsCount: habits.length
        },
        categoryBreakdown,
        dayWiseTrend,
        habits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
