import { GeoPoint, Localized } from './place';

export type Severity = 'info' | 'warning' | 'danger';

export interface SafetyAlert {
  _id: string;
  title: Localized;
  message: Localized;
  severity: Severity;
  region?: string | null;
  location?: GeoPoint;
  radius?: number | null;
  expiresAt?: string | null;
  active: boolean;
  source?: string;
  isExpired?: boolean;
  createdAt: string;
}

export type EmergencyCategory =
  | 'police'
  | 'ambulance'
  | 'fire'
  | 'tourist-police'
  | 'embassy'
  | 'hospital'
  | 'other';

export interface EmergencyContact {
  _id: string;
  name: Localized;
  category: EmergencyCategory;
  phone: string;
  altPhone?: string;
  email?: string;
  website?: string;
  country?: string | null;
  address?: string;
  region?: string | null;
  isActive: boolean;
}
