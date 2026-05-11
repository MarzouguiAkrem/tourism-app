const mongoose = require('mongoose');
const { REGIONS, INTERESTS, BUDGET_LEVELS, ITINERARY_STATUS } = require('../config/constants');

const dayStopSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    order: { type: Number, required: true },
    durationMin: { type: Number, default: 90 },
    estimatedCost: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: Date, default: null },
    region: { type: String, enum: REGIONS, default: null },
    stops: { type: [dayStopSchema], default: [] },
    estimatedCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 200, required: true },
    description: { type: String, trim: true, maxlength: 1000, default: '' },

    durationDays: { type: Number, min: 1, max: 30, required: true },
    budget: { type: Number, min: 0, default: 0 },
    budgetLevel: { type: String, enum: BUDGET_LEVELS, default: 'moderate' },
    currency: { type: String, default: 'TND' },

    interests: { type: [String], enum: INTERESTS, default: [] },
    startRegion: { type: String, enum: REGIONS, default: null },
    startLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    startDate: { type: Date, default: null },

    days: { type: [daySchema], default: [] },
    totalCost: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ITINERARY_STATUS,
      default: 'draft',
      index: true,
    },
    generated: { type: Boolean, default: false },
    generationParams: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

itinerarySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
