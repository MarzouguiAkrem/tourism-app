import { AccommodationType, GeoPoint, Place, PriceLevel } from './place';

export type ItineraryStatus = 'draft' | 'active' | 'completed';

export interface ItineraryStop {
  /** ObjectId OR a populated Place (after .populate on the backend) */
  place: string | Place;
  order: number;
  durationMin: number;
  estimatedCost: number;
  note?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string | null;
  region?: string | null;
  stops: ItineraryStop[];
  estimatedCost: number;
}

export interface Itinerary {
  _id: string;
  user: string;
  title: string;
  description?: string;

  durationDays: number;
  budget: number;
  budgetLevel: PriceLevel;
  currency: string;

  interests: string[];
  startRegion?: string | null;
  startLocation?: GeoPoint;
  startDate?: string | null;

  days: ItineraryDay[];
  totalCost: number;

  status: ItineraryStatus;
  generated: boolean;
  generationParams?: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
}

export interface GenerateItineraryPayload {
  title?: string;
  durationDays: number;
  interests?: string[];
  startRegion?: string;
  regions?: string[];
  /** [longitude, latitude] */
  startCoords?: [number, number];
  budget?: number;
  budgetLevel?: PriceLevel;
  currency?: string;
  startDate?: string;
  accommodationType?: AccommodationType;
  persist?: boolean;
}

export interface GenerateItineraryResponse {
  itinerary: Itinerary;
  warning?: string | null;
}
