const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    description: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

systemConfigSchema.statics.get = async function (key, defaultValue = null) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : defaultValue;
};

systemConfigSchema.statics.set = async function (key, value, userId = null) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedBy: userId },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
