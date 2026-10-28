import express from 'express';
import Category from '../models/Category.js';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// @route   GET /api/categories
// @desc    Get all categories for the user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ isSystem: -1, createdAt: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create a custom category
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ user: req.user._id, name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      description: description || '',
      color: color || '#6366F1',
      icon: icon || 'Tag',
      isSystem: false
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (icon) category.icon = icon;

    const updated = await category.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete custom category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Find fallback category (e.g. Planning & Miscellaneous or any other)
    const fallbackCategory = await Category.findOne({
      user: req.user._id,
      _id: { $ne: category._id }
    });

    if (fallbackCategory) {
      await Task.updateMany({ category: category._id }, { category: fallbackCategory._id });
      await Habit.updateMany({ category: category._id }, { category: fallbackCategory._id });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
