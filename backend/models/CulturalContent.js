const mongoose = require('mongoose');
const slugify = require('slugify');
const { CULTURAL_TYPES, REGIONS } = require('../config/constants');

const culturalContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: CULTURAL_TYPES, required: true, index: true },
    title: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    slug: { type: String, unique: true, lowercase: true, index: true },
    summary: {
      fr: { type: String, trim: true, maxlength: 500, default: '' },
      en: { type: String, trim: true, maxlength: 500, default: '' },
      ar: { type: String, trim: true, maxlength: 500, default: '' },
    },
    content: {
      fr: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    image: { type: String, default: null },
    images: { type: [String], default: [] },
    region: { type: String, enum: REGIONS, default: null },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

culturalContentSchema.index({ type: 1, isActive: 1, order: 1 });
culturalContentSchema.index({
  'title.fr': 'text',
  'title.en': 'text',
  'title.ar': 'text',
  'content.fr': 'text',
  'content.en': 'text',
});

culturalContentSchema.pre('validate', function () {
  if (this.title?.fr && !this.slug) {
    this.slug = slugify(`${this.type}-${this.title.fr}`, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('CulturalContent', culturalContentSchema);
