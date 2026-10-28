import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    domain: {
      type: String,
      enum: ['technical', 'government', 'general'],
      default: 'technical'
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 1
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, date: 1, domain: 1 });

export default mongoose.model('StudySession', studySessionSchema);
