export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}
