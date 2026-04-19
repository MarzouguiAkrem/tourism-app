import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope } from '../types/api';
import { Category } from '../types/place';

export const categoriesService = {
  async list(activeOnly = true): Promise<Category[]> {
    const { data } = await api.get<ApiEnvelope<Category[]>>(
      ENDPOINTS.CATEGORIES.BASE,
      { params: activeOnly ? { active: 'true' } : {} }
    );
    return data.data;
  },

  async getOne(idOrSlug: string): Promise<Category> {
    const { data } = await api.get<ApiEnvelope<Category>>(
      `${ENDPOINTS.CATEGORIES.BASE}/${idOrSlug}`
    );
    return data.data;
  },
};
