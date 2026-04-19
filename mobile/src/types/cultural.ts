export interface CulturalInfo {
  _id: string;
  type: 'custom' | 'etiquette' | 'lexicon' | 'tradition' | 'cuisine';
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  region?: string;
  language: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
}

export interface SafetyAlert {
  _id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  region?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  source?: string;
  createdAt: string;
}
