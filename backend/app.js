const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const { errorHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(generalLimiter);

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Response compression
app.use(compression());

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/places', require('./routes/place.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));
app.use('/api/v1/itineraries', require('./routes/itinerary.routes'));
app.use('/api/v1/currency', require('./routes/currency.routes'));
app.use('/api/v1/cultural', require('./routes/cultural.routes'));
app.use('/api/v1/safety', require('./routes/safety.routes'));
app.use('/api/v1/favorites', require('./routes/favorite.routes'));
app.use('/api/v1/living-costs', require('./routes/livingCost.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/sync', require('./routes/sync.routes'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tunisia Tourism API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
