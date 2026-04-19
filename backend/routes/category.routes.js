const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/category.validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

// Public
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin
router.post('/', protect, authorize('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
