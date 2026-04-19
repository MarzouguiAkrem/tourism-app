const Joi = require('joi');
const { objectId } = require('./common.validator');

const togglePlaceParamsSchema = Joi.object({
  placeId: objectId.required(),
});

module.exports = { togglePlaceParamsSchema };
