const Place = require('../models/Place');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../services/cloudinaryService');

const buildFilter = (query) => {
  const filter = { status: 'published' };
  if (query.status && ['published', 'draft', 'archived'].includes(query.status)) {
    filter.status = query.status;
  }
  if (query.category) filter.category = query.category;
  if (query.region) filter.region = query.region;
  if (query.priceLevel) filter.priceLevel = query.priceLevel;
  if (query.accommodationType) {
    const types = Array.isArray(query.accommodationType)
      ? query.accommodationType
      : String(query.accommodationType).split(',').filter(Boolean);
    filter.accommodationType = types.length === 1 ? types[0] : { $in: types };
  }
  if (query.tags) {
    const tags = Array.isArray(query.tags) ? query.tags : query.tags.split(',');
    filter.tags = { $in: tags };
  }
  if (query.minRating) {
    filter['rating.average'] = { $gte: parseFloat(query.minRating) };
  }
  if (query.search) {
    // Escape regex special chars so the user input cannot break the pattern
    const escaped = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { 'name.fr': regex },
      { 'name.en': regex },
      { 'name.ar': regex },
      { 'shortDescription.fr': regex },
      { 'shortDescription.en': regex },
      { address: regex },
    ];
  }
  return filter;
};

// @desc    List places with filters and pagination
// @route   GET /api/v1/places
// @access  Public
const getPlaces = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = buildFilter(req.query);
  const sort = req.query.sort || '-createdAt';

  const [places, total] = await Promise.all([
    Place.find(filter)
      .populate('category', 'name slug icon color')
      .skip(skip)
      .limit(limit)
      .sort(sort),
    Place.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, places, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    Full-text search
// @route   GET /api/v1/places/search
// @access  Public
const searchPlaces = catchAsync(async (req, res) => {
  const { q, limit } = req.query;

  const places = await Place.find(
    { $text: { $search: q }, status: 'published' },
    { score: { $meta: 'textScore' } }
  )
    .populate('category', 'name slug icon color')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);

  ApiResponse.success(res, places);
});

// @desc    Nearby places (geo)
// @route   GET /api/v1/places/nearby
// @access  Public
const nearbyPlaces = catchAsync(async (req, res) => {
  const { longitude, latitude, radius, limit, category } = req.query;

  const filter = {
    status: 'published',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  };
  if (category) filter.category = category;

  const places = await Place.find(filter)
    .populate('category', 'name slug icon color')
    .limit(limit);

  ApiResponse.success(res, places);
});

// @desc    Top-rated places
// @route   GET /api/v1/places/top-rated
// @access  Public
const topRatedPlaces = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

  const places = await Place.find({ status: 'published' })
    .populate('category', 'name slug icon color')
    .sort({ 'rating.average': -1, 'rating.count': -1, popularity: -1 })
    .limit(limit);

  ApiResponse.success(res, places);
});

// @desc    Single place (by id or slug); increments popularity
// @route   GET /api/v1/places/:id
// @access  Public
const getPlace = catchAsync(async (req, res) => {
  const { id } = req.params;
  const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };

  const place = await Place.findOneAndUpdate(
    query,
    { $inc: { popularity: 1 } },
    { returnDocument: 'after' }
  ).populate('category', 'name slug icon color');

  if (!place) {
    throw ApiError.notFound('Place not found');
  }
  ApiResponse.success(res, place);
});

// @desc    Create place
// @route   POST /api/v1/places
// @access  Private/Admin
const createPlace = catchAsync(async (req, res) => {
  const categoryExists = await Category.exists({ _id: req.body.category });
  if (!categoryExists) {
    throw ApiError.badRequest('Category does not exist');
  }

  const place = await Place.create({
    ...req.body,
    createdBy: req.user._id,
  });

  ApiResponse.created(res, place, 'Place created successfully');
});

// @desc    Update place
// @route   PUT /api/v1/places/:id
// @access  Private/Admin
const updatePlace = catchAsync(async (req, res) => {
  if (req.body.category) {
    const exists = await Category.exists({ _id: req.body.category });
    if (!exists) throw ApiError.badRequest('Category does not exist');
  }

  const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!place) throw ApiError.notFound('Place not found');

  ApiResponse.success(res, place, 'Place updated successfully');
});

// @desc    Delete place — soft delete (archive)
// @route   DELETE /api/v1/places/:id
// @access  Private/Admin
const deletePlace = catchAsync(async (req, res) => {
  const place = await Place.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { returnDocument: 'after' }
  );
  if (!place) throw ApiError.notFound('Place not found');
  ApiResponse.success(res, null, 'Place archived successfully');
});

// @desc    Upload place images (Cloudinary)
// @route   POST /api/v1/places/:id/images
// @access  Private/Admin
const uploadPlaceImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Please upload at least one image');
  }
  if (!cloudinary.isConfigured()) {
    throw ApiError.internal('Cloudinary is not configured on the server');
  }

  const place = await Place.findById(req.params.id);
  if (!place) throw ApiError.notFound('Place not found');

  const uploaded = await Promise.all(
    req.files.map((f) =>
      cloudinary.uploadBuffer(f.buffer, {
        folder: `tunisia-tourism/places/${place.slug}`,
        tags: ['place', place.slug],
      })
    )
  );
  const urls = uploaded.map((u) => u.url);

  place.images = [...place.images, ...urls];
  if (!place.coverImage && urls.length > 0) {
    place.coverImage = urls[0];
  }
  await place.save();

  ApiResponse.success(res, place, 'Images uploaded successfully');
});

module.exports = {
  getPlaces,
  searchPlaces,
  nearbyPlaces,
  topRatedPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  uploadPlaceImages,
};
