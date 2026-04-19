const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  const decoded = verifyToken(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('User account is deactivated');
  }

  req.user = user;
  next();
});

module.exports = { protect };
