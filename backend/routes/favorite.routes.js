const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const { togglePlaceParamsSchema } = require('../validators/favorite.validator');
const {
  toggleFavorite,
  listFavorites,
  listFavoriteIds,
  checkFavorite,
} = require('../controllers/favorite.controller');

// All favorite routes require auth
router.use(protect);

router.get('/', paginate, listFavorites);
router.get('/ids', listFavoriteIds);
router.get('/check/:placeId', validate(togglePlaceParamsSchema, 'params'), checkFavorite);
router.post('/:placeId', validate(togglePlaceParamsSchema, 'params'), toggleFavorite);

module.exports = router;
