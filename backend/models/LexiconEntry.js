const mongoose = require('mongoose');

const lexiconEntrySchema = new mongoose.Schema(
  {
    word: {
      fr: { type: String, required: true, trim: true, maxlength: 100 },
      en: { type: String, required: true, trim: true, maxlength: 100 },
      ar: { type: String, required: true, trim: true, maxlength: 100 },
    },
    pronunciation: { type: String, trim: true, default: '' }, // ar transliterated to latin
    audio: { type: String, default: null },
    category: {
      type: String,
      enum: ['greeting', 'food', 'directions', 'shopping', 'emergency', 'numbers', 'time', 'general'],
      default: 'general',
      index: true,
    },
    example: {
      fr: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

lexiconEntrySchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('LexiconEntry', lexiconEntrySchema);
