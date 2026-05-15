import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@cache:';

interface Entry<T> {
  value: T;
  expiresAt: number; // ms epoch; 0 = never
}

export const offlineCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Entry<T>;
      if (parsed.expiresAt > 0 && parsed.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(PREFIX + key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlMs = 0): Promise<void> {
    try {
      const entry: Entry<T> = {
        value,
        expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
      };
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
      // ignore — cache is best-effort
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter((k) => k.startsWith(PREFIX));
      if (ours.length) await AsyncStorage.multiRemove(ours);
    } catch {
      // ignore
    }
  },
};

export const QUEUE_KEY = '@write-queue:v1';

export interface QueuedWrite {
  id: string;
  method: 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: any;
  createdAt: number;
}

export const writeQueue = {
  async list(): Promise<QueuedWrite[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
    } catch {
      return [];
    }
  },

  async enqueue(item: Omit<QueuedWrite, 'id' | 'createdAt'>): Promise<void> {
    const list = await writeQueue.list();
    list.push({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  async replace(list: QueuedWrite[]): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
  },
};
