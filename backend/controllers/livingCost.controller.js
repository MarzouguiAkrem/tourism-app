const LivingCost = require('../models/LivingCost');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const buildFilter = (q) => {
  const filter = {};
  if (q.category) filter.category = q.category;
  if (q.region) filter.region = q.region;
  if (q.isActive !== undefined) filter.isActive = q.isActive;
  else filter.isActive = true;
  return filter;
};

const list = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = buildFilter(req.query);
  const sort = req.query.sort || 'category order';

  const [items, total] = await Promise.all([
    LivingCost.find(filter).sort(sort).skip(skip).limit(limit),
    LivingCost.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

const getOne = catchAsync(async (req, res) => {
  const item = await LivingCost.findById(req.params.id);
  if (!item) throw ApiError.notFound('Living cost not found');
  ApiResponse.success(res, item);
});

const create = catchAsync(async (req, res) => {
  const item = await LivingCost.create(req.body);
  ApiResponse.created(res, item, 'Living cost created');
});

const update = catchAsync(async (req, res) => {
  const item = await LivingCost.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Living cost not found');
  ApiResponse.success(res, item, 'Living cost updated');
});

const remove = catchAsync(async (req, res) => {
  const item = await LivingCost.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Living cost not found');
  ApiResponse.success(res, null, 'Living cost deleted');
});

module.exports = { list, getOne, create, update, remove };
