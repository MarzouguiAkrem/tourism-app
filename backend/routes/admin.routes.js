const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  updateRecommendationSchema,
  statsQuerySchema,
} = require('../validators/admin.validator');
const {
  overview,
  userGrowth,
  popularPlaces,
  regions,
  getRecommendationConfig,
  updateRecommendationConfig,
} = require('../controllers/admin.controller');

// All admin endpoints require auth + admin role
router.use(protect, authorize('admin'));

// Stats
router.get('/stats/overview', overview);
router.get('/stats/users', validate(statsQuerySchema, 'query'), userGrowth);
router.get('/stats/popular-places', validate(statsQuerySchema, 'query'), popularPlaces);
router.get('/stats/regions', regions);

// System config (recommendation weights)
router.get('/config/recommendation', getRecommendationConfig);
router.put('/config/recommendation', validate(updateRecommendationSchema), updateRecommendationConfig);

module.exports = router;
