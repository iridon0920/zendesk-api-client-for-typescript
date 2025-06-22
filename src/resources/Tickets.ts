// Ticketsリソースクラス

import { HttpClient } from '../client/HttpClient';
import { PaginationOptions, CursorPaginationOptions } from '../types/common';
import {
  TicketsResponse,
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  SearchResponse,
  CountResponse,
  BulkCreateTicketsRequest,
  BulkUpdateTicketsRequest,
  JobStatusResponse,
  CursorTicketsResponse,
} from '../types/ticket';

export class Tickets {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // チケット一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#list-tickets
  async list(options: PaginationOptions = {}): Promise<TicketsResponse> {
    const params = {
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<TicketsResponse>('/tickets.json', params);
  }

  // cursor-based paginationでチケット一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#list-tickets
  async listWithCursor(
    options: CursorPaginationOptions = {}
  ): Promise<CursorTicketsResponse> {
    const params: any = {
      'page[size]': options.page_size || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    if (options.cursor) {
      params['page[after]'] = options.cursor;
    }

    return this.httpClient.get<CursorTicketsResponse>('/tickets.json', params);
  }

  // チケット詳細取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-ticket
  async show(ticketId: number): Promise<TicketResponse> {
    return this.httpClient.get<TicketResponse>(`/tickets/${ticketId}.json`);
  }

  // チケット作成
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
  async create(ticketData: CreateTicketRequest): Promise<TicketResponse> {
    return this.httpClient.post<TicketResponse>('/tickets.json', {
      ticket: ticketData,
    });
  }

  // チケット更新
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-ticket
  async update(
    ticketId: number,
    ticketData: UpdateTicketRequest
  ): Promise<TicketResponse> {
    return this.httpClient.put<TicketResponse>(`/tickets/${ticketId}.json`, {
      ticket: ticketData,
    });
  }

  // チケット削除
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#delete-ticket
  async delete(ticketId: number): Promise<void> {
    await this.httpClient.delete(`/tickets/${ticketId}.json`);
  }

  // 複数チケット取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-multiple-tickets
  async showMany(ticketIds: number[]): Promise<TicketsResponse> {
    const ids = ticketIds.join(',');
    return this.httpClient.get<TicketsResponse>(
      `/tickets/show_many.json?ids=${ids}`
    );
  }

  // チケット検索
  // https://developer.zendesk.com/api-reference/ticketing/search/#search
  async search(
    query: string,
    options: PaginationOptions = {}
  ): Promise<SearchResponse> {
    const params = {
      query,
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<SearchResponse>('/search.json', params);
  }

  // チケット数取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_counts/#count-tickets
  async count(): Promise<CountResponse> {
    return this.httpClient.get<CountResponse>('/tickets/count.json');
  }

  // 一括チケット作成
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-many-tickets
  async createMany(
    ticketsData: BulkCreateTicketsRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.post<JobStatusResponse>(
      '/tickets/create_many.json',
      ticketsData
    );
  }

  // 一括チケット更新
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-many-tickets
  async updateMany(
    ticketsData: BulkUpdateTicketsRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.put<JobStatusResponse>(
      '/tickets/update_many.json',
      ticketsData
    );
  }

  // ジョブステータス確認
  // https://developer.zendesk.com/api-reference/ticketing/ticket-import/ticket_import/#show-job-status
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.httpClient.get<JobStatusResponse>(
      `/job_statuses/${jobId}.json`
    );
  }

  // チケットをスパムとしてマーク
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#mark-ticket-as-spam
  async markAsSpam(ticketId: number): Promise<TicketResponse> {
    return this.httpClient.put<TicketResponse>(
      `/tickets/${ticketId}/mark_as_spam.json`
    );
  }

  // チケットマージ
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_merges/#merge-tickets
  async merge(
    ticketId: number,
    targetTicketId: number,
    targetComment?: string,
    sourceComment?: string
  ): Promise<JobStatusResponse> {
    const data: any = {
      ids: [targetTicketId],
    };

    if (targetComment) {
      data.target_comment = targetComment;
    }

    if (sourceComment) {
      data.source_comment = sourceComment;
    }

    return this.httpClient.post<JobStatusResponse>(
      `/tickets/${ticketId}/merge.json`,
      data
    );
  }
}
