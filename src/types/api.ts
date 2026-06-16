export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: { page: number; pageSize: number; total: number; hasMore: boolean };
};

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
