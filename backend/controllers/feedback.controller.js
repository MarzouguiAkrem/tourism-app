const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Submit feedback (any authenticated user)
// @route   POST /api/v1/feedback
// @access  Private
const create = catchAsync(async (req, res) => {
  const fb = await Feedback.create({ ...req.body, user: req.user._id });
  ApiResponse.created(res, fb, 'Feedback submitted');
});

// @desc    List my submitted feedbacks
// @route   GET /api/v1/feedback/me
// @access  Private
const listMine = catchAsync(async (req, res) => {
  const items = await Feedback.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50);
  ApiResponse.success(res, items);
});

// @desc    Admin: list all feedbacks (filterable)
// @route   GET /api/v1/feedback
// @access  Private/Admin
const list = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.rating) filter.rating = Number(req.query.rating);

  const sort = req.query.sort || '-createdAt';

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email avatar'),
    Feedback.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    Admin: aggregate stats
// @route   GET /api/v1/feedback/stats
// @access  Private/Admin
const stats = catchAsync(async (req, res) => {
  const [overall] = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
      },
    },
  ]);
  const byCategory = await Feedback.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, avg: { $avg: '$rating' } } },
  ]);
  const byRating = await Feedback.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  ApiResponse.success(res, {
    overall: overall || { avg: 0, total: 0, new: 0 },
    byCategory,
    byRating,
  });
});

// @desc    Admin: update status / admin note
// @route   PATCH /api/v1/feedback/:id
// @access  Private/Admin
const updateStatus = catchAsync(async (req, res) => {
  const fb = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!fb) throw ApiError.notFound('Feedback not found');
  ApiResponse.success(res, fb, 'Feedback updated');
});

// @desc    Admin: delete a feedback
// @route   DELETE /api/v1/feedback/:id
// @access  Private/Admin
const remove = catchAsync(async (req, res) => {
  const fb = await Feedback.findByIdAndDelete(req.params.id);
  if (!fb) throw ApiError.notFound('Feedback not found');
  ApiResponse.success(res, null, 'Feedback deleted');
});

module.exports = { create, listMine, list, stats, updateStatus, remove };
