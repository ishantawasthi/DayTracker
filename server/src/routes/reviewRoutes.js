import express from 'express';
import DailyReview from '../models/DailyReview.js';
import Task from '../models/Task.js';
import HabitCompletion from '../models/HabitCompletion.js';
import StudySession from '../models/StudySession.js';
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

// @route   GET /api/reviews/today-summary
// @desc    Calculate live review summary for today before user submits reflection
router.get('/today-summary', async (req, res) => {
  try {
    const todayStr = req.query.date || formatDate(new Date());

    const tasks = await Task.find({ user: req.user._id, scheduledDate: todayStr })
      .populate('category', 'name color icon');

    const tasksCompleted = tasks.filter((t) => t.status === 'completed');
    const tasksPending = tasks.filter((t) => t.status === 'pending');

    const studySessions = await StudySession.find({ user: req.user._id, date: todayStr });
    const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const habitCompletions = await HabitCompletion.find({ user: req.user._id, date: todayStr })
      .populate('habit', 'title icon color');

    const existingReview = await DailyReview.findOne({ user: req.user._id, date: todayStr });

    res.json({
      success: true,
      data: {
        date: todayStr,
        tasksCompletedCount: tasksCompleted.length,
        tasksPendingCount: tasksPending.length,
        tasksCompleted,
        tasksPending,
        studySessions,
        totalStudyMinutes,
        habitCompletions,
        habitsCompletedCount: habitCompletions.length,
        existingReview
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create or update daily review record
router.post('/', async (req, res) => {
  try {
    const {
      date,
      wentWellNotes,
      toImproveNotes,
      tomorrowPlanSummary,
      tasksCompleted,
      tasksPending,
      totalStudyMinutes,
      habitsCompleted
    } = req.body;

    const reviewDate = date || formatDate(new Date());

    const review = await DailyReview.findOneAndUpdate(
      { user: req.user._id, date: reviewDate },
      {
        user: req.user._id,
        date: reviewDate,
        wentWellNotes: wentWellNotes || '',
        toImproveNotes: toImproveNotes || '',
        tomorrowPlanSummary: Array.isArray(tomorrowPlanSummary) ? tomorrowPlanSummary : [],
        tasksCompleted: Number(tasksCompleted) || 0,
        tasksPending: Number(tasksPending) || 0,
        totalStudyMinutes: Number(totalStudyMinutes) || 0,
        habitsCompleted: Number(habitsCompleted) || 0
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reviews/history
// @desc    Get historical daily reviews
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const reviews = await DailyReview.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(limit);

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
