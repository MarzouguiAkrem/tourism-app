const Joi = require('joi');
const { REGIONS } = require('../config/constants');
const { objectId } = require('./common.validator');

const localizedShort = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).required(),
});

const localizedNote = Joi.object({
  fr: Joi.string().allow(''),
  en: Joi.string().allow(''),
  ar: Joi.string().allow(''),
});

const createLivingCostSchema = Joi.object({
  item: localizedShort.required(),
  category: Joi.string()
    .valid('food', 'transport', 'accommodation', 'leisure', 'communication', 'other')
    .required(),
  priceTND: Joi.number().min(0).required(),
  priceRange: Joi.object({
    min: Joi.number().min(0).allow(null),
    max: Joi.number().min(0).allow(null),
  }),
  unit: Joi.string().allow(''),
  region: Joi.string().valid(...REGIONS).allow(null),
  note: localizedNote,
  isActive: Joi.boolean(),
  order: Joi.number().integer(),
});

const updateLivingCostSchema = createLivingCostSchema.fork(
  ['item', 'category', 'priceTND'],
  (s) => s.optional()
);

const livingCostQuerySchema = Joi.object({
  category: Joi.string(),
  region: Joi.string().valid(...REGIONS),
  isActive: Joi.boolean(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(200),
  sort: Joi.string(),
}).unknown(true);

const idParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createLivingCostSchema,
  updateLivingCostSchema,
  livingCostQuerySchema,
  idParamsSchema,
};
