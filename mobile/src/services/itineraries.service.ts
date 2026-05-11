import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import {
  GenerateItineraryPayload,
  GenerateItineraryResponse,
  Itinerary,
} from '../types/itinerary';

export const itinerariesService = {
  async listMine(page = 1, limit = 20, status?: string): Promise<PaginatedEnvelope<Itinerary>> {
    const { data } = await api.get<PaginatedEnvelope<Itinerary>>(
      ENDPOINTS.ITINERARIES.BASE,
      { params: { page, limit, status } }
    );
    return data;
  },

  async getOne(id: string): Promise<Itinerary> {
    const { data } = await api.get<ApiEnvelope<Itinerary>>(
      `${ENDPOINTS.ITINERARIES.BASE}/${id}`
    );
    return data.data;
  },

  async generate(payload: GenerateItineraryPayload): Promise<GenerateItineraryResponse> {
    const { data } = await api.post<ApiEnvelope<GenerateItineraryResponse>>(
      ENDPOINTS.ITINERARIES.GENERATE,
      payload
    );
    return data.data;
  },

  async update(id: string, patch: Partial<Itinerary>): Promise<Itinerary> {
    const { data } = await api.put<ApiEnvelope<Itinerary>>(
      `${ENDPOINTS.ITINERARIES.BASE}/${id}`,
      patch
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${ENDPOINTS.ITINERARIES.BASE}/${id}`);
  },
};
