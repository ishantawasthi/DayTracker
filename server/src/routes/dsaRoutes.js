import express from 'express';
import DsaQuestion from '../models/DsaQuestion.js';
import DsaProgress from '../models/DsaProgress.js';
import { protect } from '../middleware/auth.js';
import { STRIVER_QUESTIONS } from '../data/striverQuestions.js';

const router = express.Router();

// Auto-seed built-in Striver questions if not already seeded with exact 200 list and Striver links
export const seedDefaultQuestions = async () => {
  try {
    const sample = await DsaQuestion.findOne({ isCustom: false });
    const needsUpdate = !sample || !sample.problemUrl || !sample.problemUrl.includes('takeuforward.org');
    const count = await DsaQuestion.countDocuments({ isCustom: false });

    if (count !== 200 || needsUpdate) {
      console.log(`[DayTrack] Updating DSA Sheet to exact 200 Striver A2Z questions with Striver links (current: ${count})...`);
      await DsaQuestion.deleteMany({ isCustom: false });
      const docs = STRIVER_QUESTIONS.map((q) => ({
        number: q.number,
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        pattern: q.pattern || '',
        problemUrl: `https://takeuforward.org/?s=${encodeURIComponent(q.title)}`,
        order: q.number,
        isCustom: false,
        user: null
      }));
      await DsaQuestion.insertMany(docs);
      console.log(`[DayTrack] Successfully seeded exactly ${STRIVER_QUESTIONS.length} Striver DSA questions with Striver links.`);
    }
  } catch (err) {
    console.error('[DayTrack] Error seeding DSA questions:', err.message);
  }
};

router.use(protect);

// @route   GET /api/dsa
// @desc    Get all DSA questions, user's completed IDs, and stats
router.get('/', async (req, res) => {
  try {
    // 1. Fetch questions: standard global ones + user's custom questions
    const questions = await DsaQuestion.find({
      $or: [{ isCustom: false }, { user: req.user._id }]
    }).sort({ number: 1, order: 1, createdAt: 1 });

    // 2. Fetch user's completion progress
    let progress = await DsaProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await DsaProgress.create({ user: req.user._id, completedQuestions: [] });
    }

    const completedSet = new Set(progress.completedQuestions.map((id) => id.toString()));

    // 3. Compute stats
    let total = questions.length;
    let completed = 0;
    let easyTotal = 0, easyCompleted = 0;
    let mediumTotal = 0, mediumCompleted = 0;
    let hardTotal = 0, hardCompleted = 0;

    const topicStats = {};

    questions.forEach((q) => {
      const isDone = completedSet.has(q._id.toString());
      if (isDone) completed++;

      // Difficulty stats
      if (q.difficulty === 'Easy') {
        easyTotal++;
        if (isDone) easyCompleted++;
      } else if (q.difficulty === 'Medium') {
        mediumTotal++;
        if (isDone) mediumCompleted++;
      } else if (q.difficulty === 'Hard') {
        hardTotal++;
        if (isDone) hardCompleted++;
      }

      // Topic stats
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, completed: 0 };
      }
      topicStats[q.topic].total++;
      if (isDone) topicStats[q.topic].completed++;
    });

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({
      success: true,
      data: {
        questions,
        completedIds: Array.from(completedSet),
        stats: {
          total,
          completed,
          percentage,
          difficulty: {
            easy: { total: easyTotal, completed: easyCompleted },
            medium: { total: mediumTotal, completed: mediumCompleted },
            hard: { total: hardTotal, completed: hardCompleted }
          },
          topics: topicStats
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/dsa/:id/toggle
// @desc    Toggle question completion for the user
router.patch('/:id/toggle', async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await DsaQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let progress = await DsaProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await DsaProgress.create({ user: req.user._id, completedQuestions: [] });
    }

    const index = progress.completedQuestions.findIndex(
      (id) => id.toString() === questionId
    );

    let isCompleted = false;
    if (index > -1) {
      // Remove
      progress.completedQuestions.splice(index, 1);
      isCompleted = false;
    } else {
      // Add
      progress.completedQuestions.push(questionId);
      isCompleted = true;
    }

    await progress.save();

    res.json({
      success: true,
      isCompleted,
      questionId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/dsa
// @desc    Add a custom question
router.post('/', async (req, res) => {
  try {
    const { title, topic, difficulty, problemUrl } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Question title is required' });
    }

    const newQuestion = await DsaQuestion.create({
      title: title.trim(),
      topic: topic && topic.trim() ? topic.trim() : 'Custom',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
      problemUrl: problemUrl && problemUrl.trim()
        ? problemUrl.trim()
        : `https://leetcode.com/problemset/?search=${encodeURIComponent(title.trim())}`,
      isCustom: true,
      user: req.user._id,
      order: 9999
    });

    res.status(201).json({ success: true, data: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/dsa/:id
// @desc    Delete custom question created by user
router.delete('/:id', async (req, res) => {
  try {
    const question = await DsaQuestion.findOne({
      _id: req.params.id,
      user: req.user._id,
      isCustom: true
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Custom question not found or not authorized to delete'
      });
    }

    await DsaQuestion.deleteOne({ _id: req.params.id });

    // Also remove from user's completed list if present
    await DsaProgress.updateOne(
      { user: req.user._id },
      { $pull: { completedQuestions: req.params.id } }
    );

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

