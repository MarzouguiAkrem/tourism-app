const Joi = require('joi');
const { LANGUAGES, INTERESTS, BUDGET_LEVELS } = require('../config/constants');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().allow('', null),
  nationality: Joi.string().trim().allow('', null),
});

const updatePreferencesSchema = Joi.object({
  languages: Joi.array().items(Joi.string().valid(...LANGUAGES)).min(1),
  interests: Joi.array().items(Joi.string().valid(...INTERESTS)),
  budgetLevel: Joi.string().valid(...BUDGET_LEVELS),
  currency: Joi.string().trim().uppercase().length(3),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(8).max(128).required().messages({
    'string.min': 'New password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
});

const updateUserAdminSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  email: Joi.string().email().lowercase().trim(),
  role: Joi.string().valid('tourist', 'admin'),
  isActive: Joi.boolean(),
  phone: Joi.string().trim().allow('', null),
  nationality: Joi.string().trim().allow('', null),
});

const deleteOwnAccountSchema = Joi.object({
  password: Joi.string().allow('', null),
});

const createUserAdminSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('tourist', 'admin').default('tourist'),
  isActive: Joi.boolean().default(true),
  phone: Joi.string().trim().allow('', null),
  nationality: Joi.string().trim().allow('', null),
});

module.exports = {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  updateUserAdminSchema,
  createUserAdminSchema,
  deleteOwnAccountSchema,
};
