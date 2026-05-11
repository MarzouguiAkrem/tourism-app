const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createItinerarySchema,
  updateItinerarySchema,
  generateSchema,
  idParamsSchema,
} = require('../validators/itinerary.validator');
const {
  listMine,
  getOne,
  create,
  update,
  remove,
  generate,
  adminList,
} = require('../controllers/itinerary.controller');

router.use(protect);

// Admin
router.get('/admin/all', authorize('admin'), paginate, adminList);

// Generation
router.post('/generate', validate(generateSchema), generate);

// Owner CRUD
router.get('/', paginate, listMine);
router.post('/', validate(createItinerarySchema), create);
router.get('/:id', validate(idParamsSchema, 'params'), getOne);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateItinerarySchema), update);
router.delete('/:id', validate(idParamsSchema, 'params'), remove);

module.exports = router;
