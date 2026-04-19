import { useTranslation } from 'react-i18next';
import { LangCode, Localized } from '../types/place';

const FALLBACK_ORDER: LangCode[] = ['fr', 'en', 'ar'];

export const pickLocalized = (
  value: Localized | string | undefined | null,
  lang: LangCode
): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value[lang]) return value[lang];
  for (const code of FALLBACK_ORDER) {
    if (value[code]) return value[code];
  }
  return '';
};

export const useLocalized = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] as LangCode) || 'fr';
  return (value: Localized | string | undefined | null): string =>
    pickLocalized(value, FALLBACK_ORDER.includes(lang) ? lang : 'fr');
};
