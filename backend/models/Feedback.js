const mongoose = require('mongoose');

const FEEDBACK_CATEGORIES = ['bug', 'feature', 'improvement', 'praise', 'general'];
const FEEDBACK_STATUS = ['new', 'reviewed', 'in-progress', 'resolved', 'wont-fix'];

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    category: {
      type: String,
      enum: FEEDBACK_CATEGORIES,
      default: 'general',
      index: true,
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUS,
      default: 'new',
      index: true,
    },
    adminNote: { type: String, trim: true, default: '' },
    appVersion: { type: String, trim: true, default: '' },
    platform: { type: String, enum: ['ios', 'android', 'web', 'other'], default: 'other' },
  },
  { timestamps: true }
);

feedbackSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
module.exports.FEEDBACK_CATEGORIES = FEEDBACK_CATEGORIES;
module.exports.FEEDBACK_STATUS = FEEDBACK_STATUS;
