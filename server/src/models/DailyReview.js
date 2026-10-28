import mongoose from 'mongoose';

const dailyReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    tasksPending: {
      type: Number,
      default: 0
    },
    totalStudyMinutes: {
      type: Number,
      default: 0
    },
    habitsCompleted: {
      type: Number,
      default: 0
    },
    wentWellNotes: {
      type: String,
      default: ''
    },
    toImproveNotes: {
      type: String,
      default: ''
    },
    tomorrowPlanSummary: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

dailyReviewSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyReview', dailyReviewSchema);
