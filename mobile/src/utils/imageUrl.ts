import { config } from '../config/app.config';

// Strip the trailing /api/v1 from the base URL to reach static /uploads
const STATIC_ROOT = config.API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1605542595193-fbf0aa1b76b9?auto=format&fit=crop&w=800&q=70';

export const resolveImageUrl = (
  uri: string | null | undefined,
  fallback: string = PLACEHOLDER
): string => {
  if (!uri) return fallback;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  if (uri.startsWith('/')) return `${STATIC_ROOT}${uri}`;
  return uri;
};
