const mongoose = require('mongoose');
const { REGIONS } = require('../config/constants');

const livingCostSchema = new mongoose.Schema(
  {
    item: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'accommodation', 'leisure', 'communication', 'shopping', 'other'],
      required: true,
      index: true,
    },
    priceTND: { type: Number, required: true, min: 0 },
    priceRange: {
      min: { type: Number, default: null, min: 0 },
      max: { type: Number, default: null, min: 0 },
    },
    unit: { type: String, trim: true, default: '' }, // 'kg', 'L', 'meal', 'night', 'trip'…
    region: { type: String, enum: REGIONS, default: null, index: true },
    note: {
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

livingCostSchema.index({ category: 1, region: 1, isActive: 1 });

module.exports = mongoose.model('LivingCost', livingCostSchema);
