import { Platform, NativeModules } from 'react-native';

// Public tunnel URL (Cloudflare Quick Tunnel) — works for any device, any network.
// Update this when you restart `cloudflared tunnel --url http://localhost:5000`.
// Leave empty ('') to fall back to LAN IP (same-WiFi devices only).
const PUBLIC_TUNNEL_URL = 'https://stopping-represent-internal-lakes.trycloudflare.com';

// Fallback IP if no tunnel is set and Metro bundler URL can't be auto-detected
const FALLBACK_LOCAL_IP = '192.168.1.125';
const API_PORT = 5000;

// Pull the dev machine host from Metro's scriptURL (works on emulators & devices
// without hard-coding an IP). scriptURL looks like: http://192.168.1.125:8081/index.bundle?...
const getDevHost = (): string | null => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) return null;
  const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
  return match ? match[1] : null;
};

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (PUBLIC_TUNNEL_URL) {
      return `${PUBLIC_TUNNEL_URL}/api/v1`;
    }
    if (Platform.OS === 'web') {
      return `http://localhost:${API_PORT}/api/v1`;
    }
    const host = getDevHost() || FALLBACK_LOCAL_IP;
    return `http://${host}:${API_PORT}/api/v1`;
  }
  return 'https://your-production-url.com/api/v1';
};

export const config = {
  API_BASE_URL: getBaseUrl(),
  MAP_DEFAULT_REGION: {
    latitude: 34.0,
    longitude: 9.0,
    latitudeDelta: 5,
    longitudeDelta: 4,
  },
  TUNISIA_CENTER: {
    latitude: 34.0,
    longitude: 9.0,
  },
};
