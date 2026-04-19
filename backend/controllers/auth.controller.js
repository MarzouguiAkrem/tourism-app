const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require('../utils/tokenUtils');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, phone, nationality } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    nationality,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store hashed refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Remove sensitive fields from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  ApiResponse.created(res, {
    user: userResponse,
    accessToken,
    refreshToken,
  }, 'Registration successful');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token and update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  ApiResponse.success(res, {
    user: userResponse,
    accessToken,
    refreshToken,
  }, 'Login successful');
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Find user and check stored refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id);

  ApiResponse.success(res, { accessToken: newAccessToken }, 'Token refreshed');
});

// @desc    Forgot password - send reset token
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return ApiResponse.success(res, null, 'If an account with that email exists, a reset link has been sent');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await user.save({ validateBeforeSave: false });

  // In production, send email with reset link
  // For development, return the token directly
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // TODO: Send email with nodemailer
  // await sendResetEmail(user.email, resetUrl);

  if (process.env.NODE_ENV === 'development') {
    return ApiResponse.success(res, { resetToken, resetUrl }, 'Reset token generated (dev mode)');
  }

  ApiResponse.success(res, null, 'If an account with that email exists, a reset link has been sent');
});

// @desc    Reset password with token
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Update password and clear reset fields
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  ApiResponse.success(res, null, 'Password reset successful. Please log in with your new password.');
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, req.user, 'User profile retrieved');
});

// @desc    Logout - invalidate refresh token
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  ApiResponse.success(res, null, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
};
