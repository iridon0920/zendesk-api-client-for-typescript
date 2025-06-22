// 基本的なZendesk API型定義

export interface ZendeskConfig {
  subdomain: string;
  email: string;
  token: string;
  apiVersion?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    has_more: boolean;
    after_cursor?: string;
    before_cursor?: string;
  };
}

export interface PaginationOptions {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CursorPaginationOptions {
  page_size?: number;
  cursor?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ErrorResponse {
  error: {
    title: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
