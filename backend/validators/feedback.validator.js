const Joi = require('joi');
const { objectId } = require('./common.validator');

const FEEDBACK_CATEGORIES = ['bug', 'feature', 'improvement', 'praise', 'general'];
const FEEDBACK_STATUS = ['new', 'reviewed', 'in-progress', 'resolved', 'wont-fix'];

const createFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(2000).allow(''),
  category: Joi.string().valid(...FEEDBACK_CATEGORIES).default('general'),
  appVersion: Joi.string().trim().max(20).allow(''),
  platform: Joi.string().valid('ios', 'android', 'web', 'other').default('other'),
});

const updateFeedbackAdminSchema = Joi.object({
  status: Joi.string().valid(...FEEDBACK_STATUS),
  adminNote: Joi.string().trim().max(1000).allow(''),
}).min(1);

const listFeedbackQuerySchema = Joi.object({
  category: Joi.string().valid(...FEEDBACK_CATEGORIES),
  status: Joi.string().valid(...FEEDBACK_STATUS),
  rating: Joi.number().integer().min(1).max(5),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
}).unknown(true);

const idParamsSchema = Joi.object({ id: objectId.required() });

module.exports = {
  createFeedbackSchema,
  updateFeedbackAdminSchema,
  listFeedbackQuerySchema,
  idParamsSchema,
};
