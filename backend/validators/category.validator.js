const Joi = require('joi');
const { objectId } = require('./common.validator');

const localizedRequired = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).required(),
});

const localizedOptional = Joi.object({
  fr: Joi.string().trim().max(1000).allow(''),
  en: Joi.string().trim().max(1000).allow(''),
  ar: Joi.string().trim().max(1000).allow(''),
});

const createCategorySchema = Joi.object({
  name: localizedRequired.required(),
  description: localizedOptional,
  icon: Joi.string().trim().max(50),
  color: Joi.string().trim().pattern(/^#[0-9a-fA-F]{6}$/),
  parent: objectId.allow(null),
  order: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
});

const updateCategorySchema = createCategorySchema.fork(['name'], (s) => s.optional());

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
