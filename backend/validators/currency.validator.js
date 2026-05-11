const Joi = require('joi');

const currencyCode = Joi.string().trim().uppercase().length(3);

const convertQuerySchema = Joi.object({
  from: currencyCode.required(),
  to: currencyCode.required(),
  amount: Joi.number().min(0).required(),
});

const ratesQuerySchema = Joi.object({
  base: currencyCode,
});

module.exports = {
  convertQuerySchema,
  ratesQuerySchema,
};
