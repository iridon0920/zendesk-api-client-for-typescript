// Search API関連の型定義

import { Ticket } from './ticket';
import { User } from './user';
import { Organization } from './organization';

export type SearchResultType = 'ticket' | 'user' | 'organization' | 'group';

// 検索結果の汎用型
export interface SearchResult {
  result_type: SearchResultType;
  id: number;
  url: string;
  created_at: string;
  updated_at: string;
}

// 統合検索レスポンス（複数のリソースタイプを含む）
export interface UnifiedSearchResponse {
  results: (Ticket | User | Organization | SearchResult)[];
  count: number;
  next_page?: string;
  previous_page?: string;
  facets?: SearchFacets;
}

// タイプ別検索レスポンス
export interface TypedSearchResponse<T> {
  results: T[];
  count: number;
  next_page?: string;
  previous_page?: string;
  facets?: SearchFacets;
}

// 検索ファセット（検索結果の統計情報）
export interface SearchFacets {
  [key: string]: {
    [value: string]: number;
  };
}

// 検索オプション
export interface SearchOptions {
  query: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number; // 最大100
  include?: string[]; // サイドローディング対象
}

// 大量検索用オプション
export interface BulkSearchOptions extends Omit<SearchOptions, 'page'> {
  date_field?: 'created_at' | 'updated_at';
  start_date?: string; // ISO 8601形式
  end_date?: string; // ISO 8601形式
  chunk_size?: number; // 日付範囲の分割サイズ（日数）
  max_results?: number; // 取得する最大結果数
}

// エクスポート検索用のオプション
export interface ExportSearchOptions {
  filter_type?: 'ticket' | 'user' | 'organization' | 'group';
  page_size?: number; // 最大1000、推奨100
  cursor?: string;
}

// エクスポート検索用のカーソルベースレスポンス
export interface ExportSearchResponse<T> {
  results: T[];
  count: number;
  end_of_stream: boolean;
  next_page?: string;
  after_cursor?: string;
  after_url?: string;
  links?: {
    next?: string;
  };
  meta?: {
    has_more?: boolean;
    after_cursor?: string;
  };
}

// リソースタイプ別の検索結果型
export type TicketSearchResponse = TypedSearchResponse<Ticket>;
export type UserSearchResponse = TypedSearchResponse<User>;
export type OrganizationSearchResponse = TypedSearchResponse<Organization>;

// 検索進捗情報
export interface SearchProgress {
  total_pages: number;
  current_page: number;
  processed_results: number;
  estimated_total: number;
  start_time: Date;
  elapsed_time: number;
}

// 検索エラー
export class SearchError extends Error {
  constructor(
    message: string,
    public readonly query: string,
    public readonly page?: number
  ) {
    super(message);
    this.name = 'SearchError';
  }
}
