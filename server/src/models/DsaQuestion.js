import mongoose from 'mongoose';

const dsaQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true
    },
    problemUrl: {
      type: String,
      default: '',
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isCustom: {
      type: Boolean,
      default: false,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const DsaQuestion = mongoose.model('DsaQuestion', dsaQuestionSchema);
export default DsaQuestion;
