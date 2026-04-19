export type LangCode = 'fr' | 'en' | 'ar';

export type Localized = {
  fr: string;
  en: string;
  ar: string;
};

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PriceRange {
  min: number | null;
  max: number | null;
  currency: string;
}

export interface OpeningHour {
  day: number; // 0 = Sunday … 6 = Saturday
  open?: string; // 'HH:MM'
  close?: string;
  closed?: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Rating {
  average: number;
  count: number;
}

export type PriceLevel = 'budget' | 'moderate' | 'luxury';
export type PlaceStatus = 'published' | 'draft' | 'archived';

export interface CategoryRef {
  _id: string;
  name: Localized;
  slug: string;
  icon: string;
  color: string;
}

export interface Category extends CategoryRef {
  description?: Localized;
  parent?: string | null;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  _id: string;
  slug: string;
  name: Localized;
  shortDescription?: Localized;
  description?: Localized;
  category: CategoryRef | string;
  region: string;
  address?: string;
  location: GeoPoint;
  coverImage: string | null;
  images: string[];
  priceLevel: PriceLevel;
  priceRange?: PriceRange;
  openingHours?: OpeningHour[];
  rating: Rating;
  popularity: number;
  tags: string[];
  contact?: ContactInfo;
  status: PlaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceFilters {
  category?: string;
  region?: string;
  priceLevel?: PriceLevel;
  minRating?: number;
  tags?: string[];
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface NearbyQuery {
  longitude: number;
  latitude: number;
  radius?: number;
  limit?: number;
  category?: string;
}
