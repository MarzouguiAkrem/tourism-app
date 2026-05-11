const mongoose = require('mongoose');
const { SEVERITY_LEVELS, REGIONS } = require('../config/constants');

const safetyAlertSchema = new mongoose.Schema(
  {
    title: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    message: {
      fr: { type: String, required: true, trim: true, maxlength: 2000 },
      en: { type: String, required: true, trim: true, maxlength: 2000 },
      ar: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    severity: {
      type: String,
      enum: SEVERITY_LEVELS,
      default: 'info',
      index: true,
    },
    region: { type: String, enum: REGIONS, default: null, index: true },
    location: {
      type: { type: String, enum: ['Point'], default: null },
      coordinates: { type: [Number], default: undefined },
    },
    radius: { type: Number, default: null }, // in meters
    expiresAt: { type: Date, default: null, index: true },
    active: { type: Boolean, default: true, index: true },
    source: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

safetyAlertSchema.index({ location: '2dsphere' });
safetyAlertSchema.index({ active: 1, severity: 1, expiresAt: 1 });

safetyAlertSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

safetyAlertSchema.set('toJSON', { virtuals: true });
safetyAlertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SafetyAlert', safetyAlertSchema);
