const Joi = require('joi');
const { REGIONS, INTERESTS, BUDGET_LEVELS, ACCOMMODATION_TYPES } = require('../config/constants');
const { objectId } = require('./common.validator');

const localizedRequired = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).required(),
});

const localizedOptional = Joi.object({
  fr: Joi.string().trim().allow(''),
  en: Joi.string().trim().allow(''),
  ar: Joi.string().trim().allow(''),
});

const locationSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array()
    .ordered(
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required()
    )
    .length(2)
    .required(),
});

const openingHoursSchema = Joi.array().items(
  Joi.object({
    day: Joi.number().integer().min(0).max(6).required(),
    open: Joi.string().pattern(/^\d{2}:\d{2}$/),
    close: Joi.string().pattern(/^\d{2}:\d{2}$/),
    closed: Joi.boolean(),
  })
);

const createPlaceSchema = Joi.object({
  name: localizedRequired.required(),
  shortDescription: localizedOptional,
  description: localizedOptional,
  category: objectId.required(),
  region: Joi.string().valid(...REGIONS).required(),
  address: Joi.string().trim().allow(''),
  location: locationSchema.required(),
  coverImage: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string()),
  priceLevel: Joi.string().valid(...BUDGET_LEVELS),
  accommodationType: Joi.string().valid(...ACCOMMODATION_TYPES).allow(null),
  priceRange: Joi.object({
    min: Joi.number().min(0).allow(null),
    max: Joi.number().min(0).allow(null),
    currency: Joi.string().length(3).uppercase(),
  }),
  openingHours: openingHoursSchema,
  tags: Joi.array().items(Joi.string().valid(...INTERESTS)),
  contact: Joi.object({
    phone: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    website: Joi.string().uri().allow(''),
  }),
  status: Joi.string().valid('published', 'draft', 'archived'),
});

const updatePlaceSchema = createPlaceSchema.fork(
  ['name', 'category', 'region', 'location'],
  (s) => s.optional()
);

const nearbyQuerySchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  radius: Joi.number().min(100).max(100000).default(5000),
  limit: Joi.number().integer().min(1).max(50).default(20),
  category: objectId,
});

const searchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

module.exports = {
  createPlaceSchema,
  updatePlaceSchema,
  nearbyQuerySchema,
  searchQuerySchema,
};
