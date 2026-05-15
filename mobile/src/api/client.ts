import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { tokenStorage } from '../utils/tokenStorage';
import { config } from '../config/app.config';
import { offlineCache, writeQueue } from '../utils/offlineCache';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CACHEABLE_PREFIXES = [
  '/places',
  '/categories',
  '/cultural',
  '/safety',
  '/living-costs',
  '/currency/rates',
];

const isCacheable = (urlPath: string) =>
  CACHEABLE_PREFIXES.some((p) => urlPath === p || urlPath.startsWith(p + '?') || urlPath.startsWith(p + '/'));

const cacheKey = (url: string, params?: any) =>
  `req:${url}${params ? '?' + JSON.stringify(params) : ''}`;

const isOffline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !state.isConnected || state.isInternetReachable === false;
};

// Request interceptor: attach JWT token + serve cache when offline
api.interceptors.request.use(
  async (reqConfig) => {
    const token = await tokenStorage.getItem('accessToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    const method = (reqConfig.method || 'get').toLowerCase();
    const url = reqConfig.url || '';

    // Offline GET → try cache
    if (method === 'get' && isCacheable(url)) {
      if (await isOffline()) {
        const cached = await offlineCache.get<any>(cacheKey(url, reqConfig.params));
        if (cached) {
          // Short-circuit by throwing a synthetic adapter resolution
          const err: any = new Error('OFFLINE_CACHE_HIT');
          err.__offlineCache = cached;
          err.config = reqConfig;
          throw err;
        }
      }
    }

    // Offline mutation → enqueue
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (await isOffline()) {
        await writeQueue.enqueue({
          method: method as any,
          url,
          data: reqConfig.data,
        });
        const err: any = new Error('OFFLINE_QUEUED');
        err.__offlineQueued = true;
        err.config = reqConfig;
        throw err;
      }
    }

    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: cache successful GETs, handle 401 refresh, offline fallthroughs
api.interceptors.response.use(
  async (response) => {
    const method = (response.config.method || 'get').toLowerCase();
    const url = response.config.url || '';
    if (method === 'get' && isCacheable(url)) {
      await offlineCache.set(cacheKey(url, response.config.params), response.data, 24 * 60 * 60 * 1000);
    }
    return response;
  },
  async (error) => {
    // Offline cache short-circuit
    if (error?.__offlineCache) {
      return {
        data: error.__offlineCache,
        status: 200,
        statusText: 'OK (cache)',
        headers: {},
        config: error.config,
      } as any;
    }

    // Offline queued write
    if (error?.__offlineQueued) {
      return {
        data: { success: true, message: 'Queued offline', data: null, _queued: true },
        status: 202,
        statusText: 'Queued',
        headers: {},
        config: error.config,
      } as any;
    }

    const originalRequest = error.config;

    // Token expired - try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${config.API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        await tokenStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed - clear tokens
        await tokenStorage.deleteItem('accessToken');
        await tokenStorage.deleteItem('refreshToken');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
