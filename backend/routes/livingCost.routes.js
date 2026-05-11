const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createLivingCostSchema,
  updateLivingCostSchema,
  idParamsSchema,
} = require('../validators/livingCost.validator');
const { list, getOne, create, update, remove } = require('../controllers/livingCost.controller');

router.get('/', paginate, list);
router.get('/:id', validate(idParamsSchema, 'params'), getOne);

router.post('/', protect, authorize('admin'), validate(createLivingCostSchema), create);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateLivingCostSchema),
  update
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  remove
);

module.exports = router;
