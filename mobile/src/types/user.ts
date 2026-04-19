export interface UserPreferences {
  languages: string[];
  interests: string[];
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  currency: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'tourist' | 'admin';
  avatar: string | null;
  phone: string | null;
  nationality: string | null;
  preferences: UserPreferences;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
