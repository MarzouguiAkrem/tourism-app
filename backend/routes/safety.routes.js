const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createAlertSchema,
  updateAlertSchema,
  nearbyAlertQuerySchema,
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
  sosShareSchema,
  idParamsSchema,
} = require('../validators/safety.validator');
const {
  listAlerts,
  nearbyAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  listEmergencyContacts,
  getEmergencyContact,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  sosShare,
} = require('../controllers/safety.controller');

// ── Alerts ──────────────────────────────────────────────────
router.get('/alerts/nearby', validate(nearbyAlertQuerySchema, 'query'), nearbyAlerts);
router.get('/alerts', paginate, listAlerts);
router.get('/alerts/:id', validate(idParamsSchema, 'params'), getAlert);

router.post('/alerts', protect, authorize('admin'), validate(createAlertSchema), createAlert);
router.put(
  '/alerts/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateAlertSchema),
  updateAlert
);
router.delete(
  '/alerts/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  deleteAlert
);

// ── Emergency contacts ──────────────────────────────────────
router.get('/emergency-contacts', listEmergencyContacts);
router.get('/emergency-contacts/:id', validate(idParamsSchema, 'params'), getEmergencyContact);
router.post(
  '/emergency-contacts',
  protect,
  authorize('admin'),
  validate(createEmergencyContactSchema),
  createEmergencyContact
);
router.put(
  '/emergency-contacts/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateEmergencyContactSchema),
  updateEmergencyContact
);
router.delete(
  '/emergency-contacts/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  deleteEmergencyContact
);

// ── SOS ─────────────────────────────────────────────────────
router.post('/sos/share', protect, validate(sosShareSchema), sosShare);

module.exports = router;
