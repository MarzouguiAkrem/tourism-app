const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createFeedbackSchema,
  updateFeedbackAdminSchema,
  listFeedbackQuerySchema,
  idParamsSchema,
} = require('../validators/feedback.validator');
const {
  create,
  listMine,
  list,
  stats,
  updateStatus,
  remove,
} = require('../controllers/feedback.controller');

router.use(protect);

// ── User ────────────────────────────────────────────────────
router.post('/', validate(createFeedbackSchema), create);
router.get('/me', listMine);

// ── Admin ───────────────────────────────────────────────────
router.get('/', authorize('admin'), validate(listFeedbackQuerySchema, 'query'), paginate, list);
router.get('/stats', authorize('admin'), stats);
router.patch(
  '/:id',
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateFeedbackAdminSchema),
  updateStatus
);
router.delete(
  '/:id',
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  remove
);

module.exports = router;
