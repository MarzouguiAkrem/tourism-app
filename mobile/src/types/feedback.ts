export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'praise' | 'general';
export type FeedbackStatus = 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'wont-fix';

export interface Feedback {
  _id: string;
  user:
    | string
    | { _id: string; firstName: string; lastName: string; email: string; avatar?: string | null };
  rating: number;
  comment: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  adminNote?: string;
  appVersion?: string;
  platform?: 'ios' | 'android' | 'web' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  overall: { avg: number; total: number; new: number };
  byCategory: { _id: FeedbackCategory; count: number; avg: number }[];
  byRating: { _id: number; count: number }[];
}
