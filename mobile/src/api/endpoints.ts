// API endpoint constants
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile/me',
    PREFERENCES: '/users/profile/me/preferences',
    PASSWORD: '/users/profile/me/password',
    AVATAR: '/users/profile/me/avatar',
  },

  // Places
  PLACES: {
    BASE: '/places',
    NEARBY: '/places/nearby',
    TOP_RATED: '/places/top-rated',
    SEARCH: '/places/search',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
  },

  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_PLACE: (placeId: string) => `/places/${placeId}/reviews`,
  },

  // Itineraries
  ITINERARIES: {
    BASE: '/itineraries',
    GENERATE: '/itineraries/generate',
  },

  // Currency
  CURRENCY: {
    RATES: '/currency/rates',
    CONVERT: '/currency/convert',
  },

  // Cultural
  CULTURAL: {
    BASE: '/cultural',
    LEXICON: '/cultural/lexicon',
  },

  // Safety
  SAFETY: {
    ALERTS: '/safety/alerts',
    NEARBY: '/safety/alerts/nearby',
  },

  // Favorites
  FAVORITES: {
    BASE: '/favorites',
    CHECK: (placeId: string) => `/favorites/check/${placeId}`,
  },

  // Admin
  ADMIN: {
    STATS_OVERVIEW: '/admin/stats/overview',
    STATS_USERS: '/admin/stats/users',
    STATS_POPULAR: '/admin/stats/popular-places',
    STATS_REGIONS: '/admin/stats/regions',
  },

  // Sync (offline)
  SYNC: {
    BUNDLE: '/sync/bundle',
    VERSION: '/sync/bundle/version',
    DELTA: '/sync/delta',
  },
};
