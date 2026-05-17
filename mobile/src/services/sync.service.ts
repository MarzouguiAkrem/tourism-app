import api from '../api/client';
import { ApiEnvelope } from '../types/api';
import { offlineCache, writeQueue } from '../utils/offlineCache';

const BUNDLE_KEY = 'sync:bundle';
const VERSION_KEY = 'sync:version';

export interface SyncBundle {
  version: string;
  generatedAt: string;
  counts: Record<string, number>;
  data: {
    categories: any[];
    places: any[];
    cultural: any[];
    livingCosts: any[];
    emergencyContacts: any[];
    safetyAlerts: any[];
  };
}

export const syncService = {
  async downloadBundle(): Promise<SyncBundle> {
    const { data } = await api.get<ApiEnvelope<SyncBundle>>('/sync/bundle');
    await offlineCache.set(BUNDLE_KEY, data.data, 7 * 24 * 60 * 60 * 1000); // 7d TTL
    await offlineCache.set(VERSION_KEY, data.data.version);
    return data.data;
  },

  async cachedBundle(): Promise<SyncBundle | null> {
    return offlineCache.get<SyncBundle>(BUNDLE_KEY);
  },

  async checkVersion(): Promise<{ remote: string; local: string | null; needsUpdate: boolean }> {
    const local = await offlineCache.get<string>(VERSION_KEY);
    try {
      const { data } = await api.get<ApiEnvelope<{ version: string }>>('/sync/bundle/version');
      const remote = data.data.version;
      return { remote, local, needsUpdate: !local || local !== remote };
    } catch {
      return { remote: '', local, needsUpdate: false };
    }
  },

  async ensureBundle(): Promise<SyncBundle | null> {
    const cached = await syncService.cachedBundle();
    if (cached) return cached;
    try {
      return await syncService.downloadBundle();
    } catch {
      return null;
    }
  },

  // ── Write queue ──────────────────────────────────────────
  async flushQueue(): Promise<number> {
    const items = await writeQueue.list();
    if (items.length === 0) return 0;

    const remaining: typeof items = [];
    let sent = 0;

    for (const item of items) {
      try {
        await (api as any)[item.method](item.url, item.data);
        sent += 1;
      } catch (err: any) {
        // Network or server error — keep the item for next flush
        if (!err?.response) {
          remaining.push(item);
        } else if (err.response.status >= 500) {
          remaining.push(item);
        }
        // 4xx errors are dropped (bad data)
      }
    }

    await writeQueue.replace(remaining);
    return sent;
  },
};
