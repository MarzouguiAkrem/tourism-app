export interface ItineraryPlace {
  place: string; // Place ID or populated Place
  order: number;
  startTime: string;
  endTime: string;
  travelTimeFromPrev: number;
  notes?: string;
}

export interface ItineraryMeal {
  type: 'breakfast' | 'lunch' | 'dinner';
  suggestion: string;
  estimatedCost: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  places: ItineraryPlace[];
  meals: ItineraryMeal[];
  accommodation?: {
    name: string;
    estimatedCost: number;
  };
  notes?: string;
}

export interface EstimatedBudget {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  total: number;
}

export interface Itinerary {
  _id: string;
  user: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  estimatedBudget: EstimatedBudget;
  interests: string[];
  regions: string[];
  days: ItineraryDay[];
  isGenerated: boolean;
  isPublic: boolean;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface GenerateItineraryRequest {
  startDate: string;
  endDate: string;
  interests: string[];
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  regions?: string[];
  startLocation?: {
    longitude: number;
    latitude: number;
  };
}
