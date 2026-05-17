const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createCulturalSchema,
  updateCulturalSchema,
  idParamsSchema,
} = require('../validators/cultural.validator');
const {
  listCultural,
  getCultural,
  createCultural,
  updateCultural,
  deleteCultural,
} = require('../controllers/cultural.controller');

// Cultural content
router.get('/', paginate, listCultural);
router.get('/:id', getCultural);
router.post('/', protect, authorize('admin'), validate(createCulturalSchema), createCultural);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateCulturalSchema),
  updateCultural
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  deleteCultural
);

module.exports = router;
