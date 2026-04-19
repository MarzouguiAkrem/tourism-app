import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Language = 'fr' | 'en' | 'ar';
type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  language: Language;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  offlineModeEnabled: boolean;
  offlineDataDownloaded: boolean;
  lastOfflineSync: string | null;
}

const initialState: SettingsState = {
  language: 'fr',
  theme: 'light',
  notificationsEnabled: true,
  offlineModeEnabled: false,
  offlineDataDownloaded: false,
  lastOfflineSync: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleOfflineMode: (state) => {
      state.offlineModeEnabled = !state.offlineModeEnabled;
    },
    setOfflineDataDownloaded: (state, action: PayloadAction<boolean>) => {
      state.offlineDataDownloaded = action.payload;
      if (action.payload) {
        state.lastOfflineSync = new Date().toISOString();
      }
    },
  },
});

export const {
  setLanguage,
  setTheme,
  toggleNotifications,
  toggleOfflineMode,
  setOfflineDataDownloaded,
} = settingsSlice.actions;

export default settingsSlice.reducer;
