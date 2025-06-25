// Search API専用リソースクラス

import { HttpClient } from '../client/HttpClient';
import { Ticket } from '../types/ticket';
import { User } from '../types/user';
import { Organization } from '../types/organization';
import {
  SearchOptions,
  BulkSearchOptions,
  UnifiedSearchResponse,
  TicketSearchResponse,
  UserSearchResponse,
  OrganizationSearchResponse,
  ExportSearchResponse,
  SearchProgress,
  SearchError,
} from '../types/search';

export class Search {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // 汎用検索（全リソースタイプ対応）
  // https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
  async search(options: SearchOptions): Promise<UnifiedSearchResponse> {
    const params = this.buildSearchParams(options);
    return this.httpClient.get<UnifiedSearchResponse>('/search.json', params);
  }

  // チケット専用検索
  // https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
  async searchTickets(options: SearchOptions): Promise<TicketSearchResponse> {
    const ticketQuery = this.addTypeFilter(options.query, 'ticket');
    const params = this.buildSearchParams({ ...options, query: ticketQuery });
    return this.httpClient.get<TicketSearchResponse>('/search.json', params);
  }

  // ユーザー専用検索
  // https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
  async searchUsers(options: SearchOptions): Promise<UserSearchResponse> {
    const userQuery = this.addTypeFilter(options.query, 'user');
    const params = this.buildSearchParams({ ...options, query: userQuery });
    return this.httpClient.get<UserSearchResponse>('/search.json', params);
  }

  // 組織専用検索
  // https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
  async searchOrganizations(
    options: SearchOptions
  ): Promise<OrganizationSearchResponse> {
    const orgQuery = this.addTypeFilter(options.query, 'organization');
    const params = this.buildSearchParams({ ...options, query: orgQuery });
    return this.httpClient.get<OrganizationSearchResponse>('/search.json', params);
  }

  // エクスポート検索（カーソルベース、大量データ用）
  // https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#export-search-results
  async exportSearch<T>(
    query: string,
    options: { filter?: Record<string, string> } = {}
  ): Promise<ExportSearchResponse<T>> {
    const params: any = { query };
    if (options.filter) {
      Object.assign(params, options.filter);
    }

    return this.httpClient.get<ExportSearchResponse<T>>(
      '/search/export.json',
      params
    );
  }

  // 大量データ取得用のAsync Iterator実装
  async *searchAll<T>(
    searchFn: (options: SearchOptions) => Promise<{ results: T[]; next_page?: string }>,
    initialOptions: SearchOptions
  ): AsyncGenerator<T[], void, unknown> {
    let currentPage = initialOptions.page || 1;
    let hasMore = true;
    let totalResults = 0;
    const startTime = new Date();

    while (hasMore) {
      try {
        // レート制限情報の確認
        const rateLimitInfo = this.httpClient.getRateLimitInfo();
        if (rateLimitInfo && rateLimitInfo.remaining <= 10) {
          console.log('Rate limit approaching, pausing...');
          await this.sleep(1000);
        }

        const options = { ...initialOptions, page: currentPage };
        const response = await searchFn(options);

        if (response.results.length === 0) {
          break;
        }

        totalResults += response.results.length;
        
        yield response.results;

        // ページング情報の更新
        hasMore = !!response.next_page;
        currentPage++;

        // プログレス更新（オプション）
        if (this.onProgress) {
          const progress: SearchProgress = {
            total_pages: hasMore ? currentPage : currentPage - 1,
            current_page: currentPage - 1,
            processed_results: totalResults,
            estimated_total: totalResults,
            start_time: startTime,
            elapsed_time: Date.now() - startTime.getTime(),
          };
          this.onProgress(progress);
        }

      } catch (error) {
        throw new SearchError(
          `Search failed on page ${currentPage}: ${error}`,
          initialOptions.query,
          currentPage
        );
      }
    }
  }

  // 日付範囲での分割検索（大量データ対応）
  async *searchByDateRange<T>(
    searchFn: (options: SearchOptions) => Promise<{ results: T[]; count: number }>,
    options: BulkSearchOptions
  ): AsyncGenerator<T[], void, unknown> {
    const {
      query,
      date_field = 'created_at',
      start_date,
      end_date,
      chunk_size = 30, // 30日ずつ分割
      max_results,
    } = options;

    if (!start_date || !end_date) {
      throw new SearchError('start_date and end_date are required for date range search', query);
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const chunkSizeMs = chunk_size * 24 * 60 * 60 * 1000; // 日数をミリ秒に変換

    let currentStart = startDate;
    let totalProcessed = 0;
    const overallStart = new Date();

    while (currentStart < endDate && (!max_results || totalProcessed < max_results)) {
      const currentEnd = new Date(Math.min(
        currentStart.getTime() + chunkSizeMs,
        endDate.getTime()
      ));

      const dateRangeQuery = `${query} ${date_field}>=${currentStart.toISOString().split('T')[0]} ${date_field}<${currentEnd.toISOString().split('T')[0]}`;

      try {
        // この日付範囲での全結果を取得
        const searchOptions: SearchOptions = {
          ...options,
          query: dateRangeQuery,
          page: 1,
        };

        for await (const batch of this.searchAll(searchFn, searchOptions)) {
          if (max_results && totalProcessed + batch.length > max_results) {
            // 最大結果数に達した場合は切り詰める
            const remainingSlots = max_results - totalProcessed;
            yield batch.slice(0, remainingSlots);
            totalProcessed += remainingSlots;
            break;
          }

          yield batch;
          totalProcessed += batch.length;
        }

      } catch (error) {
        console.warn(`Failed to search date range ${currentStart.toISOString()} - ${currentEnd.toISOString()}: ${error}`);
      }

      // 進捗情報の生成
      const progress: SearchProgress = {
        total_pages: Math.ceil((endDate.getTime() - startDate.getTime()) / chunkSizeMs),
        current_page: Math.ceil((currentStart.getTime() - startDate.getTime()) / chunkSizeMs) + 1,
        processed_results: totalProcessed,
        estimated_total: totalProcessed,
        start_time: overallStart,
        elapsed_time: Date.now() - overallStart.getTime(),
      };

      if (this.onProgress) {
        this.onProgress(progress);
      }

      currentStart = currentEnd;
    }
  }

  // チケットの大量検索
  async *searchAllTickets(options: SearchOptions): AsyncGenerator<Ticket[], void, unknown> {
    yield* this.searchAll(
      (opts) => this.searchTickets(opts),
      options
    );
  }

  // ユーザーの大量検索
  async *searchAllUsers(options: SearchOptions): AsyncGenerator<User[], void, unknown> {
    yield* this.searchAll(
      (opts) => this.searchUsers(opts),
      options
    );
  }

  // 組織の大量検索
  async *searchAllOrganizations(options: SearchOptions): AsyncGenerator<Organization[], void, unknown> {
    yield* this.searchAll(
      (opts) => this.searchOrganizations(opts),
      options
    );
  }

  // ユーティリティメソッド
  private buildSearchParams(options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
      query: options.query,
    };

    if (options.sort_by) params.sort_by = options.sort_by;
    if (options.sort_order) params.sort_order = options.sort_order;
    if (options.page) params.page = options.page;
    if (options.per_page) params.per_page = Math.min(options.per_page, 100);
    if (options.include) params.include = options.include.join(',');

    return params;
  }

  private addTypeFilter(query: string, type: string): string {
    if (query.includes('type:')) {
      return query;
    }
    return `${query} type:${type}`;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // プログレスコールバック（オプション）
  private onProgress?: (progress: SearchProgress) => void;

  setProgressCallback(callback: (progress: SearchProgress) => void): void {
    this.onProgress = callback;
  }
}