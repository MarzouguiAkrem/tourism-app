const crypto = require('crypto');
const Place = require('../models/Place');
const Category = require('../models/Category');
const CulturalContent = require('../models/CulturalContent');
const LivingCost = require('../models/LivingCost');
const EmergencyContact = require('../models/EmergencyContact');
const SafetyAlert = require('../models/SafetyAlert');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const ALL_RESOURCES = [
  'categories',
  'places',
  'cultural',
  'livingCosts',
  'emergencyContacts',
  'safetyAlerts',
];

const collectBundle = async (regionFilter = null) => {
  const placeFilter = { status: 'published' };
  if (regionFilter) placeFilter.region = regionFilter;

  const [
    categories,
    places,
    cultural,
    livingCosts,
    emergencyContacts,
    safetyAlerts,
  ] = await Promise.all([
    Category.find({ isActive: true }).lean(),
    Place.find(placeFilter).lean(),
    CulturalContent.find({ isActive: true }).lean(),
    LivingCost.find({ isActive: true }).lean(),
    EmergencyContact.find({ isActive: true }).lean(),
    SafetyAlert.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean(),
  ]);

  return { categories, places, cultural, livingCosts, emergencyContacts, safetyAlerts };
};

const hashBundle = (bundle) => {
  const fingerprint = Object.fromEntries(
    Object.entries(bundle).map(([k, arr]) => [
      k,
      {
        count: arr.length,
        maxUpdatedAt: arr.reduce((m, x) => {
          const t = new Date(x.updatedAt || x.createdAt || 0).getTime();
          return t > m ? t : m;
        }, 0),
      },
    ])
  );
  const h = crypto.createHash('sha1').update(JSON.stringify(fingerprint)).digest('hex');
  return { hash: h, fingerprint };
};

// @desc    Full snapshot for first-launch / fresh install
// @route   GET /api/v1/sync/bundle
// @access  Public
const bundle = catchAsync(async (req, res) => {
  const data = await collectBundle(req.query.region || null);
  const { hash, fingerprint } = hashBundle(data);

  res.set('ETag', hash);
  res.set('Cache-Control', 'public, max-age=300');

  ApiResponse.success(res, {
    version: hash,
    generatedAt: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(data).map(([k, arr]) => [k, arr.length])),
    fingerprint,
    data,
  });
});

// @desc    Bundle version (hash + counts) — cheap, used to detect updates
// @route   GET /api/v1/sync/bundle/version
// @access  Public
const bundleVersion = catchAsync(async (req, res) => {
  const data = await collectBundle(req.query.region || null);
  const { hash, fingerprint } = hashBundle(data);
  ApiResponse.success(res, {
    version: hash,
    fingerprint,
    generatedAt: new Date().toISOString(),
  });
});

// @desc    Delta since a timestamp — only changed/added items
// @route   GET /api/v1/sync/delta?since=<ISO|ms>
// @access  Public
const delta = catchAsync(async (req, res) => {
  const sinceParam = req.query.since;
  const since = typeof sinceParam === 'string' ? new Date(sinceParam) : new Date(Number(sinceParam));
  const requested = req.query.resources
    ? req.query.resources.split(',').filter((r) => ALL_RESOURCES.includes(r))
    : ALL_RESOURCES;

  const updatedFilter = { updatedAt: { $gt: since } };
  const fetchers = {
    categories: () => Category.find(updatedFilter).lean(),
    places: () => Place.find({ ...updatedFilter, status: { $ne: 'archived' } }).lean(),
    cultural: () => CulturalContent.find(updatedFilter).lean(),
    livingCosts: () => LivingCost.find(updatedFilter).lean(),
    emergencyContacts: () => EmergencyContact.find(updatedFilter).lean(),
    safetyAlerts: () =>
      SafetyAlert.find({
        ...updatedFilter,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      }).lean(),
  };

  const entries = await Promise.all(
    requested.map(async (r) => [r, await fetchers[r]()])
  );
  const changes = Object.fromEntries(entries);
  const totalChanges = Object.values(changes).reduce((s, arr) => s + arr.length, 0);

  ApiResponse.success(res, {
    since: since.toISOString(),
    generatedAt: new Date().toISOString(),
    totalChanges,
    counts: Object.fromEntries(entries.map(([k, arr]) => [k, arr.length])),
    changes,
  });
});

module.exports = { bundle, bundleVersion, delta };
