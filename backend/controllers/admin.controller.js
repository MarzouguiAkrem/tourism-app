const User = require('../models/User');
const Place = require('../models/Place');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const Itinerary = require('../models/Itinerary');
const SafetyAlert = require('../models/SafetyAlert');
const SystemConfig = require('../models/SystemConfig');
const { DEFAULT_WEIGHTS } = require('../services/itineraryService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Counts overview
// @route   GET /api/v1/admin/stats/overview
// @access  Private/Admin
const overview = catchAsync(async (req, res) => {
  const [
    users,
    activeUsers,
    places,
    publishedPlaces,
    categories,
    reviews,
    pendingReviews,
    favorites,
    itineraries,
    generatedItineraries,
    activeAlerts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Place.countDocuments(),
    Place.countDocuments({ status: 'published' }),
    Category.countDocuments(),
    Review.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    Favorite.countDocuments(),
    Itinerary.countDocuments(),
    Itinerary.countDocuments({ generated: true }),
    SafetyAlert.countDocuments({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }),
  ]);

  ApiResponse.success(res, {
    users: { total: users, active: activeUsers },
    places: { total: places, published: publishedPlaces },
    categories,
    reviews: { total: reviews, pending: pendingReviews },
    favorites,
    itineraries: { total: itineraries, generated: generatedItineraries },
    safety: { activeAlerts },
  });
});

// @desc    User growth over a window
// @route   GET /api/v1/admin/stats/users?days=30
// @access  Private/Admin
const userGrowth = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [last7Days, lastNDays, perDay, byRole] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: since } }),
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  ApiResponse.success(res, {
    windowDays: days,
    last7Days,
    lastNDays,
    perDay: perDay.map((d) => ({ date: d._id, count: d.count })),
    byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
  });
});

// @desc    Most popular places (favorites + popularity)
// @route   GET /api/v1/admin/stats/popular-places?limit=10
// @access  Private/Admin
const popularPlaces = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const [topByFavorites, topByViews] = await Promise.all([
    Favorite.aggregate([
      { $group: { _id: '$place', favoriteCount: { $sum: 1 } } },
      { $sort: { favoriteCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: '_id',
          as: 'place',
        },
      },
      { $unwind: '$place' },
      {
        $project: {
          _id: 0,
          place: { _id: '$place._id', name: '$place.name', slug: '$place.slug', coverImage: '$place.coverImage' },
          favoriteCount: 1,
        },
      },
    ]),
    Place.find({ status: 'published' })
      .sort({ popularity: -1, 'rating.average': -1 })
      .limit(limit)
      .select('name slug coverImage popularity rating'),
  ]);

  ApiResponse.success(res, {
    byFavorites: topByFavorites,
    byViews: topByViews,
  });
});

// @desc    Region distribution
// @route   GET /api/v1/admin/stats/regions
// @access  Private/Admin
const regions = catchAsync(async (req, res) => {
  const [placesByRegion, alertsByRegion] = await Promise.all([
    Place.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    SafetyAlert.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
    ]),
  ]);

  ApiResponse.success(res, {
    placesByRegion: placesByRegion.map((r) => ({ region: r._id, count: r.count })),
    alertsByRegion: alertsByRegion.map((r) => ({ region: r._id, count: r.count })),
  });
});

// @desc    Get recommendation weights config
// @route   GET /api/v1/admin/config/recommendation
// @access  Private/Admin
const getRecommendationConfig = catchAsync(async (req, res) => {
  const cfg = await SystemConfig.findOne({ key: 'recommendation' });
  ApiResponse.success(res, {
    weights: cfg?.value?.weights || DEFAULT_WEIGHTS,
    note: cfg?.value?.note || '',
    updatedAt: cfg?.updatedAt || null,
    isDefault: !cfg,
  });
});

// @desc    Update recommendation weights config
// @route   PUT /api/v1/admin/config/recommendation
// @access  Private/Admin
const updateRecommendationConfig = catchAsync(async (req, res) => {
  const { weights, note } = req.body;

  const sum = Object.values(weights).reduce((s, v) => s + v, 0);
  if (Math.abs(sum - 1) > 0.01) {
    throw ApiError.badRequest(`Weights must sum to 1.0 (got ${sum.toFixed(2)})`);
  }

  const cfg = await SystemConfig.set(
    'recommendation',
    { weights, note: note || '' },
    req.user._id
  );

  ApiResponse.success(res, cfg, 'Recommendation config updated');
});

module.exports = {
  overview,
  userGrowth,
  popularPlaces,
  regions,
  getRecommendationConfig,
  updateRecommendationConfig,
};
