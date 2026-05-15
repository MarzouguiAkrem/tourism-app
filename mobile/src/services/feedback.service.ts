import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import { Feedback, FeedbackCategory, FeedbackStats, FeedbackStatus } from '../types/feedback';

export interface CreateFeedbackPayload {
  rating: number;
  comment?: string;
  category?: FeedbackCategory;
  appVersion?: string;
  platform?: 'ios' | 'android' | 'web' | 'other';
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  rating?: number;
}

export const feedbackService = {
  async submit(payload: CreateFeedbackPayload): Promise<Feedback> {
    const { data } = await api.post<ApiEnvelope<Feedback>>(ENDPOINTS.FEEDBACK.BASE, payload);
    return data.data;
  },

  async mine(): Promise<Feedback[]> {
    const { data } = await api.get<ApiEnvelope<Feedback[]>>(ENDPOINTS.FEEDBACK.MINE);
    return data.data;
  },

  async list(params: FeedbackListParams = {}): Promise<PaginatedEnvelope<Feedback>> {
    const { data } = await api.get<PaginatedEnvelope<Feedback>>(ENDPOINTS.FEEDBACK.BASE, {
      params,
    });
    return data;
  },

  async stats(): Promise<FeedbackStats> {
    const { data } = await api.get<ApiEnvelope<FeedbackStats>>(ENDPOINTS.FEEDBACK.STATS);
    return data.data;
  },

  async updateStatus(
    id: string,
    patch: { status?: FeedbackStatus; adminNote?: string }
  ): Promise<Feedback> {
    const { data } = await api.patch<ApiEnvelope<Feedback>>(ENDPOINTS.FEEDBACK.BY_ID(id), patch);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(ENDPOINTS.FEEDBACK.BY_ID(id));
  },
};
