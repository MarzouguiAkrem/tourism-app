import { Localized } from './place';

export type CulturalType = 'custom' | 'etiquette' | 'lexicon' | 'tradition' | 'cuisine';

export interface CulturalContent {
  _id: string;
  type: CulturalType;
  title: Localized;
  slug: string;
  summary?: Localized;
  content?: Localized;
  image: string | null;
  images: string[];
  region?: string | null;
  tags: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LexiconCategory =
  | 'greeting'
  | 'food'
  | 'directions'
  | 'shopping'
  | 'emergency'
  | 'numbers'
  | 'time'
  | 'general';

export interface LexiconEntry {
  _id: string;
  word: Localized;
  pronunciation: string;
  audio: string | null;
  category: LexiconCategory;
  example?: Localized;
  order: number;
  isActive: boolean;
}
