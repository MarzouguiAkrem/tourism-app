const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    category: {
      type: String,
      enum: ['police', 'ambulance', 'fire', 'tourist-police', 'embassy', 'hospital', 'other'],
      required: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    altPhone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    country: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true,
    }, // ISO-3166 alpha-2 — for embassies
    address: { type: String, trim: true, default: '' },
    region: { type: String, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

emergencyContactSchema.index({ category: 1, country: 1, isActive: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
