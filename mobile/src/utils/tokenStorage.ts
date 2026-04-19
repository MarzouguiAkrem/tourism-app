import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webGet = (key: string): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(key);
};

const webSet = (key: string, value: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(key, value);
};

const webDelete = (key: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(key);
};

export const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return webGet(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return webSet(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') return webDelete(key);
    return SecureStore.deleteItemAsync(key);
  },
};
