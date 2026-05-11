const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema(
  {
    base: { type: String, required: true, uppercase: true, default: 'TND' },
    rates: {
      type: Map,
      of: Number,
      default: {},
    },
    provider: { type: String, default: 'exchangerate-api' },
    fetchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

exchangeRateSchema.statics.latest = function (base = 'TND') {
  return this.findOne({ base: base.toUpperCase() }).sort({ fetchedAt: -1 });
};

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
