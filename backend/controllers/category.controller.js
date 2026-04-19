const Category = require('../models/Category');
const Place = require('../models/Place');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = catchAsync(async (req, res) => {
  const { active, parent } = req.query;
  const filter = {};
  if (active !== undefined) filter.isActive = active === 'true';
  if (parent !== undefined) filter.parent = parent === 'null' ? null : parent;

  const categories = await Category.find(filter)
    .populate('parent', 'name slug')
    .sort('order name.fr');

  ApiResponse.success(res, categories);
});

// @desc    Get single category (by id or slug)
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };

  const category = await Category.findOne(query).populate('parent', 'name slug');
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  ApiResponse.success(res, category);
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  ApiResponse.created(res, category, 'Category created successfully');
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  ApiResponse.success(res, category, 'Category updated successfully');
});

// @desc    Delete category (refuses if places reference it)
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = catchAsync(async (req, res) => {
  const placeCount = await Place.countDocuments({ category: req.params.id });
  if (placeCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category — ${placeCount} place(s) still reference it`
    );
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  ApiResponse.success(res, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
