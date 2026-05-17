const CulturalContent = require('../models/CulturalContent');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const buildCulturalFilter = (q) => {
  const filter = {};
  if (q.type) filter.type = q.type;
  if (q.region) filter.region = q.region;
  if (q.tag) filter.tags = q.tag;
  if (q.isActive !== undefined) filter.isActive = q.isActive;
  else filter.isActive = true;
  if (q.search) {
    const regex = new RegExp(q.search, 'i');
    filter.$or = [
      { 'title.fr': regex },
      { 'title.en': regex },
      { 'title.ar': regex },
    ];
  }
  return filter;
};

const listCultural = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = buildCulturalFilter(req.query);
  const sort = req.query.sort || 'order -createdAt';

  const [items, total] = await Promise.all([
    CulturalContent.find(filter).sort(sort).skip(skip).limit(limit),
    CulturalContent.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

const getCultural = catchAsync(async (req, res) => {
  const { id } = req.params;
  const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };
  const item = await CulturalContent.findOne(query);
  if (!item) throw ApiError.notFound('Cultural content not found');
  ApiResponse.success(res, item);
});

const createCultural = catchAsync(async (req, res) => {
  const item = await CulturalContent.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, item, 'Cultural content created');
});

const updateCultural = catchAsync(async (req, res) => {
  const item = await CulturalContent.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Cultural content not found');
  ApiResponse.success(res, item, 'Cultural content updated');
});

const deleteCultural = catchAsync(async (req, res) => {
  const item = await CulturalContent.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Cultural content not found');
  ApiResponse.success(res, null, 'Cultural content deleted');
});

module.exports = {
  listCultural,
  getCultural,
  createCultural,
  updateCultural,
  deleteCultural,
};
