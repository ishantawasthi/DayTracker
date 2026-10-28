import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    targetFrequency: {
      type: String,
      enum: ['daily', 'weekdays', '5_days_week', 'weekly'],
      default: 'daily'
    },
    icon: {
      type: String,
      default: 'Flame'
    },
    color: {
      type: String,
      default: '#10B981'
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Habit', habitSchema);
