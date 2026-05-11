const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerTokenSchema,
  unregisterTokenSchema,
  updatePreferencesSchema,
  updateLocationSchema,
} = require('../validators/notification.validator');
const {
  registerToken,
  unregisterToken,
  getPreferences,
  updatePreferences,
  updateLocation,
} = require('../controllers/notification.controller');

router.use(protect);

router.post('/register', validate(registerTokenSchema), registerToken);
router.post('/unregister', validate(unregisterTokenSchema), unregisterToken);
router.get('/preferences', getPreferences);
router.put('/preferences', validate(updatePreferencesSchema), updatePreferences);
router.put('/location', validate(updateLocationSchema), updateLocation);

module.exports = router;
