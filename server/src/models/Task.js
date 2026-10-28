import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    scheduledDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    scheduledTime: {
      type: String, // e.g. "07:30"
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 0
    },
    actualDuration: {
      type: Number, // in minutes
      default: 0
    },
    notes: {
      type: String,
      default: ''
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrenceRule: {
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekdays', 'weekly'],
        default: 'none'
      },
      daysOfWeek: {
        type: [Number], // 0 = Sun, 1 = Mon ... 6 = Sat
        default: []
      }
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, scheduledDate: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
