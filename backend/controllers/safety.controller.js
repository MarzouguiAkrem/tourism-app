const SafetyAlert = require('../models/SafetyAlert');
const EmergencyContact = require('../models/EmergencyContact');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ────────────────────────────────────────────────────────────
// Safety alerts
// ────────────────────────────────────────────────────────────

const buildAlertFilter = (q) => {
  const filter = {};
  if (q.severity) filter.severity = q.severity;
  if (q.region) filter.region = q.region;
  if (q.active !== undefined) filter.active = q.active;
  else filter.active = true;
  // Drop expired alerts unless explicitly asking inactive
  if (filter.active) {
    filter.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];
  }
  return filter;
};

const listAlerts = catchAsync(async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const filter = buildAlertFilter(req.query);
  const sort = req.query.sort || '-createdAt';

  const [items, total] = await Promise.all([
    SafetyAlert.find(filter).sort(sort).skip(skip).limit(limit),
    SafetyAlert.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, items, {
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  });
});

const nearbyAlerts = catchAsync(async (req, res) => {
  const { longitude, latitude, radius, severity } = req.query;
  const filter = {
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  };
  if (severity) filter.severity = severity;

  const items = await SafetyAlert.find(filter).limit(50);
  ApiResponse.success(res, items);
});

const getAlert = catchAsync(async (req, res) => {
  const alert = await SafetyAlert.findById(req.params.id);
  if (!alert) throw ApiError.notFound('Safety alert not found');
  ApiResponse.success(res, alert);
});

const createAlert = catchAsync(async (req, res) => {
  const alert = await SafetyAlert.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, alert, 'Safety alert created');
});

const updateAlert = catchAsync(async (req, res) => {
  const alert = await SafetyAlert.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!alert) throw ApiError.notFound('Safety alert not found');
  ApiResponse.success(res, alert, 'Safety alert updated');
});

const deleteAlert = catchAsync(async (req, res) => {
  const alert = await SafetyAlert.findByIdAndDelete(req.params.id);
  if (!alert) throw ApiError.notFound('Safety alert not found');
  ApiResponse.success(res, null, 'Safety alert deleted');
});

// ────────────────────────────────────────────────────────────
// Emergency contacts (SOS)
// ────────────────────────────────────────────────────────────

const listEmergencyContacts = catchAsync(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.region) filter.region = req.query.region;
  if (req.query.country) {
    // Embassies are country-scoped; universal contacts have country = null
    filter.$or = [{ country: req.query.country }, { country: null }];
  }
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive;

  const items = await EmergencyContact.find(filter).sort('category order');
  ApiResponse.success(res, items);
});

const getEmergencyContact = catchAsync(async (req, res) => {
  const item = await EmergencyContact.findById(req.params.id);
  if (!item) throw ApiError.notFound('Emergency contact not found');
  ApiResponse.success(res, item);
});

const createEmergencyContact = catchAsync(async (req, res) => {
  const item = await EmergencyContact.create(req.body);
  ApiResponse.created(res, item, 'Emergency contact created');
});

const updateEmergencyContact = catchAsync(async (req, res) => {
  const item = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Emergency contact not found');
  ApiResponse.success(res, item, 'Emergency contact updated');
});

const deleteEmergencyContact = catchAsync(async (req, res) => {
  const item = await EmergencyContact.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Emergency contact not found');
  ApiResponse.success(res, null, 'Emergency contact deleted');
});

// ────────────────────────────────────────────────────────────
// SOS: build a share payload for the mobile to consume (Linking/Share)
// ────────────────────────────────────────────────────────────

const sosShare = catchAsync(async (req, res) => {
  const { longitude, latitude, message, contacts } = req.body;
  const u = req.user;

  const payload = {
    user: {
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      phone: u.phone || null,
      nationality: u.nationality || null,
    },
    coordinates: [longitude, latitude],
    mapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
    message: message || 'Urgence — voici ma position actuelle.',
    timestamp: new Date().toISOString(),
    notifiedContacts: contacts || [],
  };

  // TODO Phase 9: actually send SMS / push to declared emergency contacts
  ApiResponse.success(res, payload, 'SOS payload ready');
});

module.exports = {
  listAlerts,
  nearbyAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  listEmergencyContacts,
  getEmergencyContact,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  sosShare,
};
