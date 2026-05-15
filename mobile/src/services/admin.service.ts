import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope } from '../types/api';

export interface OverviewStats {
  users: { total: number; active: number };
  places: { total: number; published: number };
  categories: number;
  reviews: { total: number; pending: number };
  favorites: number;
  itineraries: { total: number; generated: number };
  safety: { activeAlerts: number };
}

export interface UserGrowthStats {
  windowDays: number;
  last7Days: number;
  lastNDays: number;
  perDay: { date: string; count: number }[];
  byRole: Record<string, number>;
}

export interface PopularPlacesStats {
  byFavorites: Array<{
    place: { _id: string; name: any; slug: string; coverImage: string | null };
    favoriteCount: number;
  }>;
  byViews: Array<{
    _id: string;
    name: any;
    slug: string;
    coverImage: string | null;
    popularity: number;
    rating: { average: number; count: number };
  }>;
}

export interface RegionStats {
  placesByRegion: { region: string; count: number }[];
  alertsByRegion: { region: string; count: number }[];
}

export interface RecommendationWeights {
  interestMatch: number;
  rating: number;
  proximityStart: number;
  popularity: number;
}

export interface RecommendationConfig {
  weights: RecommendationWeights;
  note: string;
  updatedAt: string | null;
  isDefault: boolean;
}

export const adminService = {
  async overview(): Promise<OverviewStats> {
    const { data } = await api.get<ApiEnvelope<OverviewStats>>(ENDPOINTS.ADMIN.STATS_OVERVIEW);
    return data.data;
  },

  async userGrowth(days = 30): Promise<UserGrowthStats> {
    const { data } = await api.get<ApiEnvelope<UserGrowthStats>>(ENDPOINTS.ADMIN.STATS_USERS, {
      params: { days },
    });
    return data.data;
  },

  async popularPlaces(limit = 10): Promise<PopularPlacesStats> {
    const { data } = await api.get<ApiEnvelope<PopularPlacesStats>>(
      ENDPOINTS.ADMIN.STATS_POPULAR,
      { params: { limit } }
    );
    return data.data;
  },

  async regions(): Promise<RegionStats> {
    const { data } = await api.get<ApiEnvelope<RegionStats>>(ENDPOINTS.ADMIN.STATS_REGIONS);
    return data.data;
  },

  async getRecommendationConfig(): Promise<RecommendationConfig> {
    const { data } = await api.get<ApiEnvelope<RecommendationConfig>>(
      '/admin/config/recommendation'
    );
    return data.data;
  },

  async updateRecommendationConfig(
    weights: RecommendationWeights,
    note?: string
  ): Promise<any> {
    const { data } = await api.put<ApiEnvelope<any>>('/admin/config/recommendation', {
      weights,
      note,
    });
    return data.data;
  },
};
