const mongoose = require('mongoose');
const slugify = require('slugify');
const { REGIONS, INTERESTS, BUDGET_LEVELS } = require('../config/constants');

const placeSchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    slug: { type: String, unique: true, lowercase: true, index: true },
    shortDescription: {
      fr: { type: String, trim: true, maxlength: 300, default: '' },
      en: { type: String, trim: true, maxlength: 300, default: '' },
      ar: { type: String, trim: true, maxlength: 300, default: '' },
    },
    description: {
      fr: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    region: {
      type: String,
      enum: REGIONS,
      required: true,
    },
    address: { type: String, trim: true, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (v) =>
            Array.isArray(v) &&
            v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >= -90 && v[1] <= 90,
          message: 'Invalid coordinates — expected [longitude, latitude]',
        },
      },
    },
    coverImage: { type: String, default: null },
    images: { type: [String], default: [] },
    priceLevel: {
      type: String,
      enum: BUDGET_LEVELS,
      default: 'moderate',
    },
    priceRange: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'TND' },
    },
    openingHours: {
      type: [
        {
          day: { type: Number, min: 0, max: 6 }, // 0 = Sunday
          open: { type: String }, // 'HH:MM'
          close: { type: String },
          closed: { type: Boolean, default: false },
          _id: false,
        },
      ],
      default: [],
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    popularity: { type: Number, default: 0 },
    tags: {
      type: [String],
      enum: INTERESTS,
      default: [],
    },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ category: 1, region: 1, status: 1 });
placeSchema.index({ 'rating.average': -1 });
placeSchema.index({ tags: 1 });
placeSchema.index({
  'name.fr': 'text',
  'name.en': 'text',
  'name.ar': 'text',
  'description.fr': 'text',
  'description.en': 'text',
  'description.ar': 'text',
});

placeSchema.pre('validate', function () {
  if (this.name?.fr && !this.slug) {
    this.slug = slugify(this.name.fr, { lower: true, strict: true });
  }
});

placeSchema.set('toJSON', { virtuals: true });
placeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Place', placeSchema);
