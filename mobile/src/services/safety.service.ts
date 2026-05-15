import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope, PaginatedEnvelope } from '../types/api';
import { EmergencyContact, SafetyAlert, Severity } from '../types/safety';
import { Localized } from '../types/place';

export interface SafetyAlertInput {
  title: Localized;
  message: Localized;
  severity: Severity;
  region?: string | null;
  location?: { type: 'Point'; coordinates: [number, number] } | null;
  radius?: number | null;
  expiresAt?: string | null;
  active?: boolean;
  source?: string;
}

export const safetyService = {
  async alerts(severity?: Severity): Promise<SafetyAlert[]> {
    const { data } = await api.get<PaginatedEnvelope<SafetyAlert>>(ENDPOINTS.SAFETY.ALERTS, {
      params: { severity, limit: 50 },
    });
    return data.data;
  },

  async nearby(longitude: number, latitude: number, radius = 50000): Promise<SafetyAlert[]> {
    const { data } = await api.get<ApiEnvelope<SafetyAlert[]>>(ENDPOINTS.SAFETY.NEARBY, {
      params: { longitude, latitude, radius },
    });
    return data.data;
  },

  async emergencyContacts(country?: string): Promise<EmergencyContact[]> {
    const { data } = await api.get<ApiEnvelope<EmergencyContact[]>>(
      '/safety/emergency-contacts',
      { params: country ? { country } : {} }
    );
    return data.data;
  },

  async sosShare(longitude: number, latitude: number, message?: string) {
    const { data } = await api.post<ApiEnvelope<any>>('/safety/sos/share', {
      longitude,
      latitude,
      message,
    });
    return data.data;
  },
};

// ── Admin CRUD on safety alerts ─────────────────────────────
export const safetyAdminService = {
  async list(params: { page?: number; limit?: number; severity?: Severity; region?: string; active?: boolean } = {}): Promise<{
    items: SafetyAlert[];
    pagination: { page: number; limit: number; totalPages: number; totalResults: number };
  }> {
    const { data } = await api.get<PaginatedEnvelope<SafetyAlert>>(ENDPOINTS.SAFETY_ALERTS.BASE, {
      params,
    });
    return { items: data.data, pagination: data.pagination };
  },

  async getOne(id: string): Promise<SafetyAlert> {
    const { data } = await api.get<ApiEnvelope<SafetyAlert>>(ENDPOINTS.SAFETY_ALERTS.BY_ID(id));
    return data.data;
  },

  async create(input: SafetyAlertInput): Promise<SafetyAlert> {
    const { data } = await api.post<ApiEnvelope<SafetyAlert>>(
      ENDPOINTS.SAFETY_ALERTS.BASE,
      input
    );
    return data.data;
  },

  async update(id: string, patch: Partial<SafetyAlertInput>): Promise<SafetyAlert> {
    const { data } = await api.put<ApiEnvelope<SafetyAlert>>(
      ENDPOINTS.SAFETY_ALERTS.BY_ID(id),
      patch
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(ENDPOINTS.SAFETY_ALERTS.BY_ID(id));
  },
};
