const Joi = require('joi');
const { objectId } = require('./common.validator');

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(120).allow(''),
  comment: Joi.string().trim().min(3).max(2000).required(),
  visitDate: Joi.date().iso().allow(null),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  title: Joi.string().trim().max(120).allow(''),
  comment: Joi.string().trim().min(3).max(2000),
  visitDate: Joi.date().iso().allow(null),
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});

const placeIdParamsSchema = Joi.object({
  placeId: objectId.required(),
});

const reviewIdParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  updateStatusSchema,
  placeIdParamsSchema,
  reviewIdParamsSchema,
};
