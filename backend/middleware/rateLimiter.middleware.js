const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL.windowMs,
  max: RATE_LIMIT.GENERAL.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH.windowMs,
  max: RATE_LIMIT.AUTH.max,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: RATE_LIMIT.UPLOAD.windowMs,
  max: RATE_LIMIT.UPLOAD.max,
  message: {
    success: false,
    message: 'Too many upload requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };
