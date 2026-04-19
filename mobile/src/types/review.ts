import { User } from './user';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  _id: string;
  user: Pick<User, '_id' | 'firstName' | 'lastName' | 'avatar'>;
  place: string;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  visitDate?: string | null;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment: string;
  visitDate?: string | null;
}
