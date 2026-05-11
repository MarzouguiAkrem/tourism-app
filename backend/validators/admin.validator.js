const Joi = require('joi');

const updateRecommendationSchema = Joi.object({
  weights: Joi.object({
    interestMatch: Joi.number().min(0).max(1),
    rating: Joi.number().min(0).max(1),
    proximityStart: Joi.number().min(0).max(1),
    popularity: Joi.number().min(0).max(1),
  }).required(),
  note: Joi.string().max(500).allow(''),
});

const statsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(true);

module.exports = {
  updateRecommendationSchema,
  statsQuerySchema,
};
