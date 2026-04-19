const Favorite = require('../models/Favorite');
const Place = require('../models/Place');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Toggle favorite for current user
// @route   POST /api/v1/favorites/:placeId
// @access  Private
const toggleFavorite = catchAsync(async (req, res) => {
  const { placeId } = req.params;

  const placeExists = await Place.exists({ _id: placeId });
  if (!placeExists) {
    throw ApiError.notFound('Place not found');
  }

  const existing = await Favorite.findOne({ user: req.user._id, place: placeId });
  if (existing) {
    await existing.deleteOne();
    return ApiResponse.success(res, { favorited: false }, 'Removed from favorites');
  }

  await Favorite.create({ user: req.user._id, place: placeId });
  ApiResponse.created(res, { favorited: true }, 'Added to favorites');
});

// @desc    List current user's favorite places (populated)
// @route   GET /api/v1/favorites
// @access  Private
const listFavorites = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;

  const [favorites, total] = await Promise.all([
    Favorite.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'place',
        populate: { path: 'category', select: 'name slug icon color' },
      }),
    Favorite.countDocuments({ user: req.user._id }),
  ]);

  // Filter out favorites whose place was archived/deleted
  const places = favorites.map((f) => f.place).filter(Boolean);

  ApiResponse.paginated(res, places, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    List only the IDs of favorited places (lightweight, for client cache)
// @route   GET /api/v1/favorites/ids
// @access  Private
const listFavoriteIds = catchAsync(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).select('place -_id');
  const ids = favorites.map((f) => f.place.toString());
  ApiResponse.success(res, ids);
});

// @desc    Check if a single place is favorited by current user
// @route   GET /api/v1/favorites/check/:placeId
// @access  Private
const checkFavorite = catchAsync(async (req, res) => {
  const exists = await Favorite.exists({
    user: req.user._id,
    place: req.params.placeId,
  });
  ApiResponse.success(res, { favorited: !!exists });
});

module.exports = {
  toggleFavorite,
  listFavorites,
  listFavoriteIds,
  checkFavorite,
};
