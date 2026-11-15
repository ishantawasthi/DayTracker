import mongoose from 'mongoose';

const dsaProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    completedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DsaQuestion'
      }
    ]
  },
  {
    timestamps: true
  }
);

const DsaProgress = mongoose.model('DsaProgress', dsaProgressSchema);
export default DsaProgress;

