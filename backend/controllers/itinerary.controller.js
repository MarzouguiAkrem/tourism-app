const Itinerary = require('../models/Itinerary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const itineraryService = require('../services/itineraryService');

const populateOpts = [
  { path: 'days.stops.place', select: 'name slug coverImage region location rating priceLevel category' },
];

// @desc    List current user's itineraries
// @route   GET /api/v1/itineraries
// @access  Private
const listMine = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Itinerary.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Itinerary.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    Single itinerary (owner or admin)
// @route   GET /api/v1/itineraries/:id
// @access  Private
const getOne = catchAsync(async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id).populate(populateOpts);
  if (!itinerary) throw ApiError.notFound('Itinerary not found');

  if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only access your own itineraries');
  }

  ApiResponse.success(res, itinerary);
});

// @desc    Create itinerary manually (no auto-generation)
// @route   POST /api/v1/itineraries
// @access  Private
const create = catchAsync(async (req, res) => {
  const itinerary = await Itinerary.create({
    ...req.body,
    user: req.user._id,
  });
  ApiResponse.created(res, itinerary, 'Itinerary created');
});

// @desc    Update an itinerary
// @route   PUT /api/v1/itineraries/:id
// @access  Private (owner)
const update = catchAsync(async (req, res) => {
  const existing = await Itinerary.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Itinerary not found');
  if (existing.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only update your own itineraries');
  }

  Object.assign(existing, req.body);
  await existing.save();

  ApiResponse.success(res, existing, 'Itinerary updated');
});

// @desc    Delete an itinerary
// @route   DELETE /api/v1/itineraries/:id
// @access  Private (owner)
const remove = catchAsync(async (req, res) => {
  const existing = await Itinerary.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Itinerary not found');
  if (existing.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own itineraries');
  }

  await existing.deleteOne();
  ApiResponse.success(res, null, 'Itinerary deleted');
});

// @desc    Generate an itinerary (scoring + clustering + nearest-neighbor + budget cap)
// @route   POST /api/v1/itineraries/generate
// @access  Private
const generate = catchAsync(async (req, res) => {
  const {
    title,
    durationDays,
    interests,
    startRegion,
    regions,
    startCoords,
    budget,
    budgetLevel,
    currency,
    startDate,
    accommodationType,
    persist,
  } = req.body;

  const result = await itineraryService.generate({
    durationDays,
    interests,
    startRegion,
    regions,
    startCoords,
    budget,
    budgetLevel,
    accommodationType,
  });

  if (!result.days.length) {
    throw ApiError.badRequest(result.warning || 'Could not generate itinerary — no matching places');
  }

  const payload = {
    user: req.user._id,
    title: title || `Voyage ${durationDays} jour${durationDays > 1 ? 's' : ''} en Tunisie`,
    durationDays,
    interests: interests || [],
    startRegion: startRegion || null,
    startLocation: startCoords ? { type: 'Point', coordinates: startCoords } : undefined,
    startDate: startDate || null,
    budget: budget || 0,
    budgetLevel: budgetLevel || 'moderate',
    currency: currency || 'TND',
    days: result.days,
    totalCost: result.totalCost,
    status: 'draft',
    generated: true,
    generationParams: {
      interests,
      startRegion,
      regions,
      startCoords,
      budget,
      budgetLevel,
      accommodationType,
      weights: result.weights,
    },
  };

  if (persist === false) {
    return ApiResponse.success(res, {
      ...payload,
      warning: result.warning,
    }, 'Itinerary generated (preview)');
  }

  const itinerary = await Itinerary.create(payload);
  await itinerary.populate(populateOpts);

  ApiResponse.created(res, {
    itinerary,
    warning: result.warning,
  }, 'Itinerary generated');
});

// @desc    Admin: list all itineraries
// @route   GET /api/v1/itineraries/admin/all
// @access  Private/Admin
const adminList = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.user) filter.user = req.query.user;

  const [items, total] = await Promise.all([
    Itinerary.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email'),
    Itinerary.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

module.exports = {
  listMine,
  getOne,
  create,
  update,
  remove,
  generate,
  adminList,
};
