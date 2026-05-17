import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import {
  AccommodationType,
  GeoPoint,
  Localized,
  NearbyQuery,
  Place,
  PlaceFilters,
  PlaceStatus,
  PriceLevel,
  PriceRange,
} from '../types/place';

export interface PlacePayload {
  name: Localized;
  shortDescription?: Partial<Localized>;
  description?: Partial<Localized>;
  category: string;
  region: string;
  address?: string;
  location: GeoPoint;
  coverImage?: string | null;
  images?: string[];
  priceLevel?: PriceLevel;
  accommodationType?: AccommodationType | null;
  priceRange?: PriceRange;
  tags?: string[];
  status?: PlaceStatus;
  contact?: { phone?: string; email?: string; website?: string };
}

export const placesService = {
  async list(filters: PlaceFilters = {}): Promise<PaginatedEnvelope<Place>> {
    const params: Record<string, unknown> = { ...filters };
    if (Array.isArray(filters.tags)) params.tags = filters.tags.join(',');
    if (Array.isArray(filters.accommodationType)) {
      params.accommodationType = filters.accommodationType.join(',');
    }
    const { data } = await api.get<PaginatedEnvelope<Place>>(
      ENDPOINTS.PLACES.BASE,
      { params }
    );
    return data;
  },

  async topRated(limit = 10): Promise<Place[]> {
    const { data } = await api.get<ApiEnvelope<Place[]>>(
      ENDPOINTS.PLACES.TOP_RATED,
      { params: { limit } }
    );
    return data.data;
  },

  async nearby(query: NearbyQuery): Promise<Place[]> {
    const { data } = await api.get<ApiEnvelope<Place[]>>(
      ENDPOINTS.PLACES.NEARBY,
      { params: query }
    );
    return data.data;
  },

  async search(q: string, limit = 20): Promise<Place[]> {
    const { data } = await api.get<ApiEnvelope<Place[]>>(
      ENDPOINTS.PLACES.SEARCH,
      { params: { q, limit } }
    );
    return data.data;
  },

  async getOne(idOrSlug: string): Promise<Place> {
    const { data } = await api.get<ApiEnvelope<Place>>(
      `${ENDPOINTS.PLACES.BASE}/${idOrSlug}`
    );
    return data.data;
  },

  async create(payload: PlacePayload): Promise<Place> {
    const { data } = await api.post<ApiEnvelope<Place>>(
      ENDPOINTS.PLACES.BASE,
      payload
    );
    return data.data;
  },

  async update(id: string, payload: Partial<PlacePayload>): Promise<Place> {
    const { data } = await api.put<ApiEnvelope<Place>>(
      `${ENDPOINTS.PLACES.BASE}/${id}`,
      payload
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${ENDPOINTS.PLACES.BASE}/${id}`);
  },
};
