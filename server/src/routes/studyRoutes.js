import express from 'express';
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

// @route   POST /api/study/sessions
// @desc    Record a completed study session
router.post('/sessions', async (req, res) => {
  try {
    const { subject, domain, durationMinutes, notes, date } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid duration in minutes is required' });
    }

    // Determine domain automatically if not explicitly provided
    let studyDomain = domain;
    if (!studyDomain) {
      const lower = subject.toLowerCase();
      if (lower.includes('ssc') || lower.includes('quant') || lower.includes('reasoning') || lower.includes('general awareness') || lower.includes('govt')) {
        studyDomain = 'government';
      } else if (lower.includes('java') || lower.includes('dsa') || lower.includes('mern') || lower.includes('react') || lower.includes('sql') || lower.includes('dbms') || lower.includes('tech')) {
        studyDomain = 'technical';
      } else {
        studyDomain = 'general';
      }
    }

    const session = await StudySession.create({
      user: req.user._id,
      subject: subject.trim(),
      domain: studyDomain,
      durationMinutes: Math.round(Number(durationMinutes)),
      date: date || formatDate(new Date()),
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/study/sessions
// @desc    Get study sessions with optional date or limit filter
router.get('/sessions', async (req, res) => {
  try {
    const { date, domain, limit } = req.query;
    const filter = { user: req.user._id };

    if (date) filter.date = date;
    if (domain) filter.domain = domain;

    const sessions = await StudySession.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50);

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/study/stats
// @desc    Get study analytics (today, weekly, by subject, tech vs govt comparison)
router.get('/stats', async (req, res) => {
  try {
    const todayStr = req.query.date || formatDate(new Date());

    // Calculate start of current week (7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = formatDate(sevenDaysAgo);

    const allRecentSessions = await StudySession.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgoStr }
    });

    // Today stats
    const todaySessions = allRecentSessions.filter((s) => s.date === todayStr);
    const todayTotalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const todayTechMinutes = todaySessions
      .filter((s) => s.domain === 'technical')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const todayGovtMinutes = todaySessions
      .filter((s) => s.domain === 'government')
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Weekly stats
    const weeklyTotalMinutes = allRecentSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const weeklyTechMinutes = allRecentSessions
      .filter((s) => s.domain === 'technical')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const weeklyGovtMinutes = allRecentSessions
      .filter((s) => s.domain === 'government')
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Subject breakdown
    const subjectMinutes = {};
    allRecentSessions.forEach((s) => {
      subjectMinutes[s.subject] = (subjectMinutes[s.subject] || 0) + s.durationMinutes;
    });

    // 7-day trend
    const last7DaysTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      const daySessions = allRecentSessions.filter((s) => s.date === dStr);
      const techMin = daySessions.filter((s) => s.domain === 'technical').reduce((acc, s) => acc + s.durationMinutes, 0);
      const govtMin = daySessions.filter((s) => s.domain === 'government').reduce((acc, s) => acc + s.durationMinutes, 0);
      last7DaysTrend.push({
        date: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        technicalMinutes: techMin,
        governmentMinutes: govtMin,
        totalMinutes: techMin + govtMin
      });
    }

    res.json({
      success: true,
      data: {
        today: {
          totalMinutes: todayTotalMinutes,
          technicalMinutes: todayTechMinutes,
          governmentMinutes: todayGovtMinutes
        },
        weekly: {
          totalMinutes: weeklyTotalMinutes,
          technicalMinutes: weeklyTechMinutes,
          governmentMinutes: weeklyGovtMinutes
        },
        subjectMinutes,
        last7DaysTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/study/sessions/:id
// @desc    Delete study session log
router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
