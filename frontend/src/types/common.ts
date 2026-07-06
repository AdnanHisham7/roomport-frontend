export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface ApiErrorShape {
  message?: string;
  suggestion?: string;
  errors?: string[];
}
