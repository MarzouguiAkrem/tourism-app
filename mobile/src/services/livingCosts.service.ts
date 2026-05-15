import api from '../api/client';
import { PaginatedEnvelope } from '../types/api';
import { LivingCost, LivingCostCategory } from '../types/livingCost';

export const livingCostsService = {
  async list(category?: LivingCostCategory): Promise<LivingCost[]> {
    const { data } = await api.get<PaginatedEnvelope<LivingCost>>('/living-costs', {
      params: { category, limit: 200 },
    });
    return data.data;
  },
};
