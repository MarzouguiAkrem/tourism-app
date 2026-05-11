const Joi = require('joi');
const { SEVERITY_LEVELS, REGIONS } = require('../config/constants');
const { objectId } = require('./common.validator');

const localizedShort = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).required(),
});

const localizedMessage = Joi.object({
  fr: Joi.string().trim().max(2000).required(),
  en: Joi.string().trim().max(2000).required(),
  ar: Joi.string().trim().max(2000).required(),
});

const createAlertSchema = Joi.object({
  title: localizedShort.required(),
  message: localizedMessage.required(),
  severity: Joi.string().valid(...SEVERITY_LEVELS),
  region: Joi.string().valid(...REGIONS).allow(null),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array()
      .ordered(
        Joi.number().min(-180).max(180).required(),
        Joi.number().min(-90).max(90).required()
      )
      .length(2),
  }),
  radius: Joi.number().min(0).max(500000).allow(null),
  expiresAt: Joi.date().allow(null),
  active: Joi.boolean(),
  source: Joi.string().allow(''),
});

const updateAlertSchema = createAlertSchema.fork(['title', 'message'], (s) => s.optional());

const alertQuerySchema = Joi.object({
  severity: Joi.string().valid(...SEVERITY_LEVELS),
  region: Joi.string().valid(...REGIONS),
  active: Joi.boolean(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
}).unknown(true);

const nearbyAlertQuerySchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  radius: Joi.number().min(100).max(500000).default(50000),
  severity: Joi.string().valid(...SEVERITY_LEVELS),
});

const createEmergencyContactSchema = Joi.object({
  name: localizedShort.required(),
  category: Joi.string()
    .valid('police', 'ambulance', 'fire', 'tourist-police', 'embassy', 'hospital', 'other')
    .required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().allow(''),
  email: Joi.string().email().allow(''),
  website: Joi.string().uri().allow(''),
  country: Joi.string().length(2).uppercase().allow(null),
  address: Joi.string().allow(''),
  region: Joi.string().allow(null),
  isActive: Joi.boolean(),
  order: Joi.number().integer(),
});

const updateEmergencyContactSchema = createEmergencyContactSchema.fork(
  ['name', 'category', 'phone'],
  (s) => s.optional()
);

const emergencyContactQuerySchema = Joi.object({
  category: Joi.string(),
  country: Joi.string().length(2).uppercase(),
  region: Joi.string(),
  isActive: Joi.boolean(),
}).unknown(true);

const sosShareSchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  message: Joi.string().max(500).allow(''),
  contacts: Joi.array().items(Joi.string()).max(10),
});

const idParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
  alertQuerySchema,
  nearbyAlertQuerySchema,
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
  emergencyContactQuerySchema,
  sosShareSchema,
  idParamsSchema,
};
