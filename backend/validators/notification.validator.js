const Joi = require('joi');

const registerTokenSchema = Joi.object({
  token: Joi.string().trim().required(),
  platform: Joi.string().valid('ios', 'android', 'web').default('android'),
});

const unregisterTokenSchema = Joi.object({
  token: Joi.string().trim().required(),
});

const updatePreferencesSchema = Joi.object({
  safetyAlerts: Joi.boolean(),
  itineraryReminders: Joi.boolean(),
  promotions: Joi.boolean(),
}).min(1);

const updateLocationSchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
});

module.exports = {
  registerTokenSchema,
  unregisterTokenSchema,
  updatePreferencesSchema,
  updateLocationSchema,
};
