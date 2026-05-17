module.exports = {
  ROLES: {
    TOURIST: 'tourist',
    ADMIN: 'admin',
  },

  REGIONS: [
    'tunis',
    'nord',
    'nord-ouest',
    'nord-est',
    'centre',
    'centre-ouest',
    'centre-est',
    'sud-ouest',
    'sud-est',
    'sud',
  ],

  INTERESTS: [
    'history',
    'beach',
    'desert',
    'culture',
    'food',
    'adventure',
    'nature',
    'shopping',
    'nightlife',
    'architecture',
    'religious',
    'wellness',
  ],

  BUDGET_LEVELS: ['budget', 'moderate', 'luxury'],

  ACCOMMODATION_TYPES: [
    'hotel',
    'hostel',
    'riad',
    'guesthouse',
    'apartment',
    'resort',
    'camping',
    'ecolodge',
  ],

  LANGUAGES: ['fr', 'en', 'ar'],

  SEVERITY_LEVELS: ['info', 'warning', 'danger'],

  CULTURAL_TYPES: ['custom', 'etiquette', 'tradition', 'cuisine'],

  ITINERARY_STATUS: ['draft', 'active', 'completed'],

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  RATE_LIMIT: {
    GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
    UPLOAD: { windowMs: 60 * 60 * 1000, max: 20 },
  },
};
