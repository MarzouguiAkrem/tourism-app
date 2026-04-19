import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';

const LANGUAGE_KEY = 'user-language';
const SUPPORTED_LANGUAGES = ['fr', 'en', 'ar'];

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
        callback(storedLang);
        return;
      }

      const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'fr';
      callback(SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : 'fr');
    } catch {
      callback('fr');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // Silently fail
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common'],
    resources: {
      fr: { common: frCommon },
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
export { LANGUAGE_KEY, SUPPORTED_LANGUAGES };
