const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const currencyService = require('../services/currencyService');

// @desc    All rates against TND (base) — single source of truth
// @route   GET /api/v1/currency/rates
// @access  Public
const getRates = catchAsync(async (req, res) => {
  const doc = await currencyService.getLatestRates();
  const rates = doc.rates instanceof Map ? Object.fromEntries(doc.rates) : doc.rates;

  ApiResponse.success(res, {
    base: doc.base,
    rates,
    fetchedAt: doc.fetchedAt,
    provider: doc.provider,
  });
});

// @desc    Convert an amount between two currencies
// @route   GET /api/v1/currency/convert
// @access  Public
const convert = catchAsync(async (req, res) => {
  const { from, to, amount } = req.query;

  try {
    const result = await currencyService.convert({ from, to, amount });
    ApiResponse.success(res, result);
  } catch (err) {
    if (err.statusCode === 400) throw ApiError.badRequest(err.message);
    throw err;
  }
});

// @desc    Force refresh from upstream (admin)
// @route   POST /api/v1/currency/refresh
// @access  Private/Admin
const refresh = catchAsync(async (req, res) => {
  const doc = await currencyService.refreshRates();
  ApiResponse.success(res, {
    fetchedAt: doc.fetchedAt,
    provider: doc.provider,
    rateCount: doc.rates instanceof Map ? doc.rates.size : Object.keys(doc.rates).length,
  }, 'Exchange rates refreshed');
});

module.exports = { getRates, convert, refresh };
