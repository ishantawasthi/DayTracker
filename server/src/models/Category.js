import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#6366F1'
    },
    icon: {
      type: String,
      default: 'Folder'
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
