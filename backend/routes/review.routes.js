const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  updateReviewSchema,
  updateStatusSchema,
  reviewIdParamsSchema,
} = require('../validators/review.validator');
const {
  listMyReviews,
  updateReview,
  deleteReview,
  updateReviewStatus,
  adminListReviews,
} = require('../controllers/review.controller');

// All routes here require auth
router.use(protect);

// Current user
router.get('/mine', paginate, listMyReviews);

// Owner or admin
router.put(
  '/:id',
  validate(reviewIdParamsSchema, 'params'),
  validate(updateReviewSchema),
  updateReview
);
router.delete('/:id', validate(reviewIdParamsSchema, 'params'), deleteReview);

// Admin moderation
router.get('/', authorize('admin'), paginate, adminListReviews);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(reviewIdParamsSchema, 'params'),
  validate(updateStatusSchema),
  updateReviewStatus
);

module.exports = router;
