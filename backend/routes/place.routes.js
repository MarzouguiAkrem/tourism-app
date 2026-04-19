const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');
const {
  createPlaceSchema,
  updatePlaceSchema,
  nearbyQuerySchema,
  searchQuerySchema,
} = require('../validators/place.validator');
const {
  getPlaces,
  searchPlaces,
  nearbyPlaces,
  topRatedPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  uploadPlaceImages,
} = require('../controllers/place.controller');
const {
  createReview,
  listPlaceReviews,
} = require('../controllers/review.controller');
const {
  createReviewSchema,
} = require('../validators/review.validator');

// Public — order matters: specific paths before /:id
router.get('/search', validate(searchQuerySchema, 'query'), searchPlaces);
router.get('/nearby', validate(nearbyQuerySchema, 'query'), nearbyPlaces);
router.get('/top-rated', topRatedPlaces);
router.get('/', paginate, getPlaces);
router.get('/:id', getPlace);

// Admin
router.post('/', protect, authorize('admin'), validate(createPlaceSchema), createPlace);
router.put('/:id', protect, authorize('admin'), validate(updatePlaceSchema), updatePlace);
router.delete('/:id', protect, authorize('admin'), deletePlace);
router.post(
  '/:id/images',
  protect,
  authorize('admin'),
  uploadMultiple('images', 10),
  uploadPlaceImages
);

// Nested reviews routes: /places/:placeId/reviews
router.get('/:placeId/reviews', paginate, listPlaceReviews);
router.post('/:placeId/reviews', protect, validate(createReviewSchema), createReview);

module.exports = router;
