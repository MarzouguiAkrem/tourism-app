import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import { CreateReviewData, Review } from '../types/review';

export const reviewsService = {
  async listByPlace(placeId: string, page = 1, limit = 20): Promise<PaginatedEnvelope<Review>> {
    const { data } = await api.get<PaginatedEnvelope<Review>>(
      ENDPOINTS.REVIEWS.BY_PLACE(placeId),
      { params: { page, limit } }
    );
    return data;
  },

  async create(placeId: string, payload: CreateReviewData): Promise<Review> {
    const { data } = await api.post<ApiEnvelope<Review>>(
      ENDPOINTS.REVIEWS.BY_PLACE(placeId),
      payload
    );
    return data.data;
  },

  async listMine(page = 1, limit = 20): Promise<PaginatedEnvelope<Review>> {
    const { data } = await api.get<PaginatedEnvelope<Review>>(
      `${ENDPOINTS.REVIEWS.BASE}/mine`,
      { params: { page, limit } }
    );
    return data;
  },

  async update(reviewId: string, payload: Partial<CreateReviewData>): Promise<Review> {
    const { data } = await api.put<ApiEnvelope<Review>>(
      `${ENDPOINTS.REVIEWS.BASE}/${reviewId}`,
      payload
    );
    return data.data;
  },

  async remove(reviewId: string): Promise<void> {
    await api.delete(`${ENDPOINTS.REVIEWS.BASE}/${reviewId}`);
  },
};
