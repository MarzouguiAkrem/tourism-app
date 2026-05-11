const Joi = require('joi');

const deltaQuerySchema = Joi.object({
  since: Joi.alternatives()
    .try(Joi.date().iso(), Joi.number().integer().min(0))
    .required(),
  resources: Joi.string(), // comma-separated whitelist
});

const bundleQuerySchema = Joi.object({
  locale: Joi.string().valid('fr', 'en', 'ar'),
  region: Joi.string(),
}).unknown(true);

module.exports = { deltaQuerySchema, bundleQuerySchema };
