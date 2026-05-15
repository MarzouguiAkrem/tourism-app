import { Localized } from './place';

export type LivingCostCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'leisure'
  | 'communication'
  | 'shopping'
  | 'other';

export interface LivingCost {
  _id: string;
  item: Localized;
  category: LivingCostCategory;
  priceTND: number;
  priceRange?: { min: number | null; max: number | null };
  unit?: string;
  region?: string | null;
  note?: Localized;
  isActive: boolean;
  order: number;
}
