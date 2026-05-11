const Joi = require('joi');
const { CULTURAL_TYPES, REGIONS } = require('../config/constants');
const { objectId } = require('./common.validator');

const localizedRequired = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).required(),
});

const localizedLong = Joi.object({
  fr: Joi.string().trim().allow(''),
  en: Joi.string().trim().allow(''),
  ar: Joi.string().trim().allow(''),
});

const createCulturalSchema = Joi.object({
  type: Joi.string().valid(...CULTURAL_TYPES).required(),
  title: localizedRequired.required(),
  summary: localizedLong,
  content: localizedLong,
  image: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string()),
  region: Joi.string().valid(...REGIONS).allow(null),
  tags: Joi.array().items(Joi.string()),
  order: Joi.number().integer(),
  isActive: Joi.boolean(),
});

const updateCulturalSchema = createCulturalSchema.fork(['type', 'title'], (s) => s.optional());

const culturalQuerySchema = Joi.object({
  type: Joi.string().valid(...CULTURAL_TYPES),
  region: Joi.string().valid(...REGIONS),
  tag: Joi.string(),
  search: Joi.string().max(200),
  isActive: Joi.boolean(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
}).unknown(true);

const createLexiconSchema = Joi.object({
  word: localizedRequired.required(),
  pronunciation: Joi.string().allow(''),
  audio: Joi.string().allow('', null),
  category: Joi.string().valid(
    'greeting',
    'food',
    'directions',
    'shopping',
    'emergency',
    'numbers',
    'time',
    'general'
  ),
  example: localizedLong,
  order: Joi.number().integer(),
  isActive: Joi.boolean(),
});

const updateLexiconSchema = createLexiconSchema.fork(['word'], (s) => s.optional());

const lexiconQuerySchema = Joi.object({
  category: Joi.string(),
  search: Joi.string().max(200),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(200),
}).unknown(true);

const idParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createCulturalSchema,
  updateCulturalSchema,
  culturalQuerySchema,
  createLexiconSchema,
  updateLexiconSchema,
  lexiconQuerySchema,
  idParamsSchema,
};
