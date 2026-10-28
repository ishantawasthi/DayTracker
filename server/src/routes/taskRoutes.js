import express from 'express';
import Task from '../models/Task.js';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Helper to get formatted date string YYYY-MM-DD
const formatDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @route   GET /api/tasks
// @desc    Get tasks with range, date, status, category, priority filters
router.get('/', async (req, res) => {
  try {
    const { range, date, category, status, priority, search } = req.query;
    const filter = { user: req.user._id };

    const todayStr = date || formatDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    if (range === 'today') {
      filter.scheduledDate = todayStr;
    } else if (range === 'tomorrow') {
      filter.scheduledDate = tomorrowStr;
    } else if (range === 'upcoming') {
      filter.scheduledDate = { $gt: todayStr };
    } else if (range === 'overdue') {
      filter.scheduledDate = { $lt: todayStr };
      filter.status = 'pending';
    } else if (date && !range) {
      filter.scheduledDate = date;
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('category', 'name color icon')
      .sort({ scheduledDate: 1, scheduledTime: 1, priority: -1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/dashboard-summary
// @desc    Get today's tasks summary, progress %, overdue tasks, priority tasks
router.get('/dashboard-summary', async (req, res) => {
  try {
    const todayStr = req.query.date || formatDate(new Date());

    const todayTasks = await Task.find({ user: req.user._id, scheduledDate: todayStr })
      .populate('category', 'name color icon')
      .sort({ priority: -1, scheduledTime: 1 });

    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
    const pendingToday = totalToday - completedToday;
    const completionPercentage = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

    const overdueCount = await Task.countDocuments({
      user: req.user._id,
      scheduledDate: { $lt: todayStr },
      status: 'pending'
    });

    const highPriorityTasks = todayTasks.filter(
      (t) => t.priority === 'high' && t.status === 'pending'
    );

    res.json({
      success: true,
      data: {
        date: todayStr,
        totalToday,
        completedToday,
        pendingToday,
        completionPercentage,
        overdueCount,
        highPriorityTasks,
        todayTasks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      category,
      scheduledDate,
      scheduledTime,
      priority,
      notes,
      estimatedDuration,
      isRecurring,
      recurrenceRule
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    // Ensure category exists or default to first category for user
    let catId = category;
    if (!catId) {
      const defaultCat = await Category.findOne({ user: req.user._id });
      catId = defaultCat ? defaultCat._id : null;
    }

    const taskDate = scheduledDate || formatDate(new Date());

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      category: catId,
      scheduledDate: taskDate,
      scheduledTime: scheduledTime || '',
      priority: priority || 'medium',
      notes: notes || '',
      estimatedDuration: Number(estimatedDuration) || 0,
      isRecurring: Boolean(isRecurring),
      recurrenceRule: recurrenceRule || { frequency: 'none', daysOfWeek: [] }
    });

    const populatedTask = await Task.findById(task._id).populate('category', 'name color icon');
    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    await task.save();
    const updated = await Task.findById(task._id).populate('category', 'name color icon');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tasks/:id/reschedule
// @desc    Reschedule task to a different date
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    if (!scheduledDate) {
      return res.status(400).json({ success: false, message: 'New scheduled date is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime;

    await task.save();
    const updated = await Task.findById(task._id).populate('category', 'name color icon');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      category,
      scheduledDate,
      scheduledTime,
      priority,
      status,
      notes,
      estimatedDuration,
      actualDuration,
      isRecurring,
      recurrenceRule
    } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (title) task.title = title.trim();
    if (category) task.category = category;
    if (scheduledDate) task.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime;
    if (priority) task.priority = priority;
    if (notes !== undefined) task.notes = notes;
    if (estimatedDuration !== undefined) task.estimatedDuration = Number(estimatedDuration);
    if (actualDuration !== undefined) task.actualDuration = Number(actualDuration);
    if (isRecurring !== undefined) task.isRecurring = isRecurring;
    if (recurrenceRule !== undefined) task.recurrenceRule = recurrenceRule;

    if (status && status !== task.status) {
      task.status = status;
      task.completedAt = status === 'completed' ? new Date() : null;
    }

    await task.save();
    const updated = await Task.findById(task._id).populate('category', 'name color icon');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks/batch-plan-tomorrow
// @desc    Batch create tasks or move selected pending tasks to tomorrow
router.post('/batch-plan-tomorrow', async (req, res) => {
  try {
    const { moveTaskIds, newTasks, tomorrowDate } = req.body;
    const tomorrowStr = tomorrowDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return formatDate(d);
    })();

    let movedCount = 0;
    if (Array.isArray(moveTaskIds) && moveTaskIds.length > 0) {
      const updateResult = await Task.updateMany(
        { _id: { $in: moveTaskIds }, user: req.user._id },
        { scheduledDate: tomorrowStr }
      );
      movedCount = updateResult.modifiedCount;
    }

    let createdTasks = [];
    if (Array.isArray(newTasks) && newTasks.length > 0) {
      const defaultCat = await Category.findOne({ user: req.user._id });
      const tasksToInsert = newTasks.map((t) => ({
        user: req.user._id,
        title: typeof t === 'string' ? t.trim() : t.title.trim(),
        category: (t.category && t.category !== '') ? t.category : (defaultCat ? defaultCat._id : null),
        scheduledDate: tomorrowStr,
        scheduledTime: t.scheduledTime || '',
        priority: t.priority || 'medium',
        notes: t.notes || ''
      }));

      createdTasks = await Task.insertMany(tasksToInsert);
    }

    res.json({
      success: true,
      message: `Planned tomorrow with ${movedCount} rescheduled and ${createdTasks.length} newly added tasks.`,
      movedCount,
      createdCount: createdTasks.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
