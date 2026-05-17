import { Localized } from './place';

export type CulturalType = 'custom' | 'etiquette' | 'tradition' | 'cuisine';

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
