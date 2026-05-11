const Joi = require('joi');
const { REGIONS, INTERESTS, BUDGET_LEVELS, ITINERARY_STATUS } = require('../config/constants');
const { objectId } = require('./common.validator');

const stopSchema = Joi.object({
  place: objectId.required(),
  order: Joi.number().integer().min(1).required(),
  durationMin: Joi.number().integer().min(15).max(720),
  estimatedCost: Joi.number().min(0),
  note: Joi.string().allow(''),
});

const daySchema = Joi.object({
  dayNumber: Joi.number().integer().min(1).required(),
  date: Joi.date(),
  region: Joi.string().valid(...REGIONS).allow(null),
  stops: Joi.array().items(stopSchema).default([]),
  estimatedCost: Joi.number().min(0),
});

const createItinerarySchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).allow(''),
  durationDays: Joi.number().integer().min(1).max(30).required(),
  budget: Joi.number().min(0),
  budgetLevel: Joi.string().valid(...BUDGET_LEVELS),
  currency: Joi.string().length(3).uppercase(),
  interests: Joi.array().items(Joi.string().valid(...INTERESTS)),
  startRegion: Joi.string().valid(...REGIONS).allow(null),
  startLocation: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array()
      .ordered(
        Joi.number().min(-180).max(180).required(),
        Joi.number().min(-90).max(90).required()
      )
      .length(2),
  }),
  startDate: Joi.date(),
  days: Joi.array().items(daySchema).default([]),
  status: Joi.string().valid(...ITINERARY_STATUS),
});

const updateItinerarySchema = createItinerarySchema.fork(
  ['title', 'durationDays'],
  (s) => s.optional()
);

const generateSchema = Joi.object({
  title: Joi.string().trim().max(200),
  durationDays: Joi.number().integer().min(1).max(30).required(),
  interests: Joi.array().items(Joi.string().valid(...INTERESTS)).default([]),
  startRegion: Joi.string().valid(...REGIONS),
  regions: Joi.array().items(Joi.string().valid(...REGIONS)),
  startCoords: Joi.array()
    .ordered(
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required()
    )
    .length(2),
  budget: Joi.number().min(0),
  budgetLevel: Joi.string().valid(...BUDGET_LEVELS).default('moderate'),
  currency: Joi.string().length(3).uppercase().default('TND'),
  startDate: Joi.date(),
  persist: Joi.boolean().default(true),
});

const idParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createItinerarySchema,
  updateItinerarySchema,
  generateSchema,
  idParamsSchema,
};
