import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import { Place } from '../types/place';

export const favoritesService = {
  async toggle(placeId: string): Promise<boolean> {
    const { data } = await api.post<ApiEnvelope<{ favorited: boolean }>>(
      `${ENDPOINTS.FAVORITES.BASE}/${placeId}`
    );
    return data.data.favorited;
  },

  async listIds(): Promise<string[]> {
    const { data } = await api.get<ApiEnvelope<string[]>>(
      `${ENDPOINTS.FAVORITES.BASE}/ids`
    );
    return data.data;
  },

  async list(page = 1, limit = 20): Promise<PaginatedEnvelope<Place>> {
    const { data } = await api.get<PaginatedEnvelope<Place>>(
      ENDPOINTS.FAVORITES.BASE,
      { params: { page, limit } }
    );
    return data;
  },

  async check(placeId: string): Promise<boolean> {
    const { data } = await api.get<ApiEnvelope<{ favorited: boolean }>>(
      ENDPOINTS.FAVORITES.CHECK(placeId)
    );
    return data.data.favorited;
  },
};
