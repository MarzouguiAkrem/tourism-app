const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const pushService = require('../services/pushService');

// @desc    Register an Expo push token for the current user
// @route   POST /api/v1/notifications/register
// @access  Private
const registerToken = catchAsync(async (req, res) => {
  const { token, platform } = req.body;
  await pushService.registerToken(req.user._id, token, platform);
  ApiResponse.success(res, { registered: true }, 'Push token registered');
});

// @desc    Unregister a push token
// @route   POST /api/v1/notifications/unregister
// @access  Private
const unregisterToken = catchAsync(async (req, res) => {
  const { token } = req.body;
  await pushService.unregisterToken(req.user._id, token);
  ApiResponse.success(res, { unregistered: true }, 'Push token removed');
});

// @desc    Read notification preferences
// @route   GET /api/v1/notifications/preferences
// @access  Private
const getPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPreferences');
  ApiResponse.success(res, user.notificationPreferences);
});

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
const updatePreferences = catchAsync(async (req, res) => {
  const update = {};
  Object.entries(req.body).forEach(([k, v]) => {
    update[`notificationPreferences.${k}`] = v;
  });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { returnDocument: 'after' }
  ).select('notificationPreferences');
  ApiResponse.success(res, user.notificationPreferences, 'Preferences updated');
});

// @desc    Update user's last-known location (for geo-targeted pushes)
// @route   PUT /api/v1/notifications/location
// @access  Private
const updateLocation = catchAsync(async (req, res) => {
  const { longitude, latitude } = req.body;
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        lastKnownLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          updatedAt: new Date(),
        },
      },
    }
  );
  ApiResponse.success(res, null, 'Location updated');
});

module.exports = {
  registerToken,
  unregisterToken,
  getPreferences,
  updatePreferences,
  updateLocation,
};
