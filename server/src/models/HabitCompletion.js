import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

habitCompletionSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

export default mongoose.model('HabitCompletion', habitCompletionSchema);
