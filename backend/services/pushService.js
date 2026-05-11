const axios = require('axios');
const User = require('../models/User');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a batch of push notifications via Expo's push API.
 * Silently no-ops in dev if no tokens are passed.
 * messages = [{ to, title, body, data, channelId? }, ...]  (Expo schema)
 */
const sendExpoPush = async (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return { sent: 0 };
  try {
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }
    const results = [];
    for (const chunk of chunks) {
      const { data } = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
        },
        timeout: 10000,
      });
      results.push(data);
    }
    return { sent: messages.length, results };
  } catch (err) {
    console.error('[push] expo send failed:', err.message);
    return { sent: 0, error: err.message };
  }
};

const toRad = (d) => (d * Math.PI) / 180;
const haversineMeters = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
};

const localized = (field, locale = 'fr') => field?.[locale] || field?.fr || field?.en || '';

/**
 * Find users who should receive a SafetyAlert and send a push.
 * Geo logic:
 *  - alert.location + radius → users within radius (lastKnownLocation)
 *  - else alert.region → all users (best-effort, region not stored on User)
 *  - else broadcast to everyone with notificationPreferences.safetyAlerts
 */
const sendAlertToNearbyUsers = async (alert) => {
  const users = await User.find({
    isActive: true,
    'notificationPreferences.safetyAlerts': true,
    'pushTokens.0': { $exists: true },
  }).lean();

  if (users.length === 0) return { sent: 0 };

  const targets = [];
  if (alert.location?.coordinates && alert.radius) {
    for (const u of users) {
      if (!u.lastKnownLocation?.coordinates) continue;
      const d = haversineMeters(alert.location.coordinates, u.lastKnownLocation.coordinates);
      if (d <= alert.radius) targets.push(u);
    }
  } else {
    targets.push(...users);
  }

  const messages = [];
  for (const u of targets) {
    for (const t of u.pushTokens || []) {
      messages.push({
        to: t.token,
        sound: 'default',
        title: localized(alert.title),
        body: localized(alert.message),
        data: { type: 'safety-alert', alertId: alert._id?.toString(), severity: alert.severity },
        priority: alert.severity === 'danger' ? 'high' : 'default',
        channelId: 'safety-alerts',
      });
    }
  }

  return sendExpoPush(messages);
};

const registerToken = async (userId, token, platform = 'android') => {
  if (!token) return;
  await User.updateOne(
    { _id: userId },
    { $pull: { pushTokens: { token } } }
  );
  await User.updateOne(
    { _id: userId },
    { $push: { pushTokens: { token, platform, createdAt: new Date() } } }
  );
};

const unregisterToken = async (userId, token) => {
  await User.updateOne({ _id: userId }, { $pull: { pushTokens: { token } } });
};

module.exports = {
  sendExpoPush,
  sendAlertToNearbyUsers,
  registerToken,
  unregisterToken,
};
