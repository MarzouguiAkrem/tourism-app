import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import { CulturalContent, CulturalType, LexiconCategory, LexiconEntry } from '../types/cultural';

export const culturalService = {
  async list(type?: CulturalType): Promise<CulturalContent[]> {
    const { data } = await api.get<PaginatedEnvelope<CulturalContent>>(ENDPOINTS.CULTURAL.BASE, {
      params: { type, limit: 100 },
    });
    return data.data;
  },

  async getOne(idOrSlug: string): Promise<CulturalContent> {
    const { data } = await api.get<ApiEnvelope<CulturalContent>>(
      `${ENDPOINTS.CULTURAL.BASE}/${idOrSlug}`
    );
    return data.data;
  },

  async lexicon(category?: LexiconCategory, search?: string): Promise<LexiconEntry[]> {
    const { data } = await api.get<PaginatedEnvelope<LexiconEntry>>(ENDPOINTS.CULTURAL.LEXICON, {
      params: { category, search, limit: 200 },
    });
    return data.data;
  },
};
