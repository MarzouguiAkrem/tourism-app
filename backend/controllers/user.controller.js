const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ──────────────────────────────────────────────
//  ADMIN ENDPOINTS
// ──────────────────────────────────────────────

// @desc    Get all users (admin)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const { search, role } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort('-createdAt'),
    User.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, users, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

// @desc    Get single user (admin)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  ApiResponse.success(res, user);
});

// @desc    Update user (admin)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user, 'User updated successfully');
});

// @desc    Delete (deactivate) user (admin)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  user.isActive = false;
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, null, 'User deactivated successfully');
});

// ──────────────────────────────────────────────
//  SELF PROFILE ENDPOINTS
// ──────────────────────────────────────────────

// @desc    Get own profile
// @route   GET /api/v1/users/profile/me
// @access  Private
const getProfile = catchAsync(async (req, res) => {
  ApiResponse.success(res, req.user);
});

// @desc    Update own profile
// @route   PUT /api/v1/users/profile/me
// @access  Private
const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'nationality'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    returnDocument: 'after',
    runValidators: true,
  });

  ApiResponse.success(res, user, 'Profile updated successfully');
});

// @desc    Update preferences
// @route   PUT /api/v1/users/profile/me/preferences
// @access  Private
const updatePreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Merge preferences
  Object.keys(req.body).forEach((key) => {
    user.preferences[key] = req.body[key];
  });

  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, user, 'Preferences updated successfully');
});

// @desc    Change password
// @route   PUT /api/v1/users/profile/me/password
// @access  Private
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  ApiResponse.success(res, null, 'Password changed successfully. Please log in again.');
});

// @desc    Upload/update avatar
// @route   PUT /api/v1/users/profile/me/avatar
// @access  Private
const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { returnDocument: 'after' }
  );

  ApiResponse.success(res, user, 'Avatar updated successfully');
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  updateAvatar,
};
