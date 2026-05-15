import api from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ApiEnvelope } from '../types/api';
import { User } from '../types/user';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  nationality?: string | null;
}

export interface UpdatePreferencesPayload {
  languages?: string[];
  interests?: string[];
  budgetLevel?: 'budget' | 'moderate' | 'luxury';
  currency?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async updateProfile(patch: UpdateProfilePayload): Promise<User> {
    const { data } = await api.put<ApiEnvelope<User>>(ENDPOINTS.USERS.PROFILE, patch);
    return data.data;
  },

  async updatePreferences(patch: UpdatePreferencesPayload): Promise<User> {
    const { data } = await api.put<ApiEnvelope<User>>(ENDPOINTS.USERS.PREFERENCES, patch);
    return data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.put(ENDPOINTS.USERS.PASSWORD, payload);
  },

  async uploadAvatar(uri: string): Promise<User> {
    const form = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mime = match ? `image/${match[1].toLowerCase().replace('jpg', 'jpeg')}` : 'image/jpeg';
    form.append('avatar', { uri, name: filename, type: mime } as any);

    const { data } = await api.put<ApiEnvelope<User>>(ENDPOINTS.USERS.AVATAR, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async deleteAccount(password?: string): Promise<void> {
    await api.delete(ENDPOINTS.USERS.DELETE_ME, {
      data: password ? { password } : {},
    });
  },
};

// ── Admin: gestion des utilisateurs ─────────────────────────
export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'tourist' | 'admin';
}

export interface AdminUserListResponse {
  data: User[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number; totalResults: number };
}

export interface UpdateUserAdminPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'tourist' | 'admin';
  isActive?: boolean;
  phone?: string | null;
  nationality?: string | null;
}

export interface CreateUserAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'tourist' | 'admin';
  isActive?: boolean;
  phone?: string | null;
  nationality?: string | null;
}

export const adminUserService = {
  async list(params: AdminUserListParams = {}): Promise<AdminUserListResponse> {
    const { data } = await api.get(ENDPOINTS.USERS.BASE, { params });
    return {
      data: data.data,
      count: data.count,
      pagination: data.pagination,
    };
  },

  async create(payload: CreateUserAdminPayload): Promise<User> {
    const { data } = await api.post<ApiEnvelope<User>>(ENDPOINTS.USERS.BASE, payload);
    return data.data;
  },

  async getOne(id: string): Promise<User> {
    const { data } = await api.get<ApiEnvelope<User>>(ENDPOINTS.USERS.BY_ID(id));
    return data.data;
  },

  async update(id: string, patch: UpdateUserAdminPayload): Promise<User> {
    const { data } = await api.put<ApiEnvelope<User>>(ENDPOINTS.USERS.BY_ID(id), patch);
    return data.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(ENDPOINTS.USERS.BY_ID(id));
  },

  async reactivate(id: string): Promise<User> {
    const { data } = await api.patch<ApiEnvelope<User>>(ENDPOINTS.USERS.ACTIVATE(id));
    return data.data;
  },
};
