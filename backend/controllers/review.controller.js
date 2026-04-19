const Review = require('../models/Review');
const Place = require('../models/Place');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a review for a place
// @route   POST /api/v1/places/:placeId/reviews
// @access  Private
const createReview = catchAsync(async (req, res) => {
  const { placeId } = req.params;
  const placeExists = await Place.exists({ _id: placeId });
  if (!placeExists) throw ApiError.notFound('Place not found');

  const existing = await Review.findOne({ user: req.user._id, place: placeId });
  if (existing) {
    throw ApiError.conflict('You have already reviewed this place. Edit your review instead.');
  }

  const review = await Review.create({
    user: req.user._id,
    place: placeId,
    ...req.body,
  });

  const populated = await review.populate('user', 'firstName lastName avatar');
  ApiResponse.created(res, populated, 'Review created');
});

// @desc    List approved reviews for a place (paginated)
// @route   GET /api/v1/places/:placeId/reviews
// @access  Public
const listPlaceReviews = catchAsync(async (req, res) => {
  const { placeId } = req.params;
  const { page, limit, skip } = req.pagination;

  const filter = { place: placeId, status: 'approved' };
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, reviews, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    List current user's reviews
// @route   GET /api/v1/reviews/mine
// @access  Private
const listMyReviews = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user._id })
      .populate('place', 'name slug coverImage region')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ user: req.user._id }),
  ]);

  ApiResponse.paginated(res, reviews, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    Update own review
// @route   PUT /api/v1/reviews/:id
// @access  Private (owner)
const updateReview = catchAsync(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { returnDocument: 'after', runValidators: true }
  );
  if (!review) throw ApiError.notFound('Review not found or not owned by you');
  ApiResponse.success(res, review, 'Review updated');
});

// @desc    Delete own review (or admin)
// @route   DELETE /api/v1/reviews/:id
// @access  Private (owner or admin)
const deleteReview = catchAsync(async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

  const review = await Review.findOneAndDelete(filter);
  if (!review) throw ApiError.notFound('Review not found or not owned by you');
  ApiResponse.success(res, null, 'Review deleted');
});

// @desc    Admin moderation: change status
// @route   PATCH /api/v1/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after' }
  );
  if (!review) throw ApiError.notFound('Review not found');
  ApiResponse.success(res, review, `Review ${req.body.status}`);
});

// @desc    List all reviews (admin, with status filter)
// @route   GET /api/v1/reviews
// @access  Private/Admin
const adminListReviews = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('place', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, reviews, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

module.exports = {
  createReview,
  listPlaceReviews,
  listMyReviews,
  updateReview,
  deleteReview,
  updateReviewStatus,
  adminListReviews,
};
