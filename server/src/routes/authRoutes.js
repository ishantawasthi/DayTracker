import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'daytrack_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user and seed default categories
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    // Seed the 8 default life domains for the user
    const userCategories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      user: user._id
    }));
    await Category.insertMany(userCategories);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        jobSchedule: user.jobSchedule,
        themePreference: user.themePreference,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        jobSchedule: user.jobSchedule,
        themePreference: user.themePreference,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile / work hours / theme
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, jobSchedule, themePreference } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (jobSchedule) user.jobSchedule = { ...user.jobSchedule, ...jobSchedule };
    if (themePreference) user.themePreference = themePreference;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
