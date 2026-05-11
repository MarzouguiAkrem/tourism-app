const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { paginate } = require('../middleware/pagination.middleware');
const {
  createCulturalSchema,
  updateCulturalSchema,
  createLexiconSchema,
  updateLexiconSchema,
  idParamsSchema,
} = require('../validators/cultural.validator');
const {
  listCultural,
  getCultural,
  createCultural,
  updateCultural,
  deleteCultural,
  listLexicon,
  getLexicon,
  createLexicon,
  updateLexicon,
  deleteLexicon,
} = require('../controllers/cultural.controller');

// Lexicon (must be declared before /:id catch-all)
router.get('/lexicon', paginate, listLexicon);
router.get('/lexicon/:id', validate(idParamsSchema, 'params'), getLexicon);
router.post(
  '/lexicon',
  protect,
  authorize('admin'),
  validate(createLexiconSchema),
  createLexicon
);
router.put(
  '/lexicon/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  validate(updateLexiconSchema),
  updateLexicon
);
router.delete(
  '/lexicon/:id',
  protect,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  deleteLexicon
);

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
