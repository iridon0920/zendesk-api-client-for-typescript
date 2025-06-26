// Ticketsリソースクラス

import { HttpClient } from '../client/HttpClient';
import { PaginationOptions, CursorPaginationOptions } from '../types/common';
import {
  TicketsResponse,
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  CountResponse,
  BulkCreateTicketsRequest,
  BulkUpdateTicketsRequest,
  JobStatusResponse,
  CursorTicketsResponse,
  TicketCommentsResponse,
  CommentResponse,
  ImportTicketRequest,
  ImportTicketResponse,
  BulkImportTicketsRequest,
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

  // 一括チケット作成（完了まで待機）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-many-tickets
  async createManyAndWait(
    ticketsData: BulkCreateTicketsRequest,
    waitOptions?: {
      intervalMs?: number;
      timeoutMs?: number;
    }
  ): Promise<JobStatusResponse> {
    const jobResponse = await this.createMany(ticketsData);
    return this.waitForJobCompletion(jobResponse.job_status.id, waitOptions);
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

  // 一括チケット更新（完了まで待機）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-many-tickets
  async updateManyAndWait(
    ticketsData: BulkUpdateTicketsRequest,
    waitOptions?: {
      intervalMs?: number;
      timeoutMs?: number;
    }
  ): Promise<JobStatusResponse> {
    const jobResponse = await this.updateMany(ticketsData);
    return this.waitForJobCompletion(jobResponse.job_status.id, waitOptions);
  }

  // ジョブステータス確認
  // https://developer.zendesk.com/api-reference/ticketing/ticket-import/ticket_import/#show-job-status
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.httpClient.get<JobStatusResponse>(
      `/job_statuses/${jobId}.json`
    );
  }

  // ジョブ完了まで待機
  async waitForJobCompletion(
    jobId: string,
    options: {
      intervalMs?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<JobStatusResponse> {
    const intervalMs = options.intervalMs || 1000;
    const timeoutMs = options.timeoutMs || 300000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const response = await this.getJobStatus(jobId);
      const status = response.job_status.status;

      if (status === 'completed' || status === 'failed') {
        return response;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Job ${jobId} did not complete within ${timeoutMs}ms`);
  }

  // ジョブ結果から成功したリソースIDを取得
  getSuccessfulResourceIds(jobStatusResponse: JobStatusResponse): number[] {
    if (!jobStatusResponse.job_status.results) {
      return [];
    }

    return jobStatusResponse.job_status.results
      .filter((result) => {
        // successフィールドがある場合はそれを使用、ない場合はidが存在すれば成功とみなす
        if (result.success !== undefined) {
          return result.success === true && result.id;
        }
        return result.id !== undefined;
      })
      .map((result) => result.id!)
      .filter((id) => id !== undefined);
  }

  // ジョブ結果から失敗したリソース情報を取得
  getFailedResults(jobStatusResponse: JobStatusResponse): Array<{
    index?: number;
    id?: number;
    errors?: string;
    details?: string;
  }> {
    if (!jobStatusResponse.job_status.results) {
      return [];
    }

    return jobStatusResponse.job_status.results
      .filter((result) => {
        // successフィールドがある場合はfalseのもの、ない場合はerrorsがあるものを失敗とみなす
        if (result.success !== undefined) {
          return result.success === false;
        }
        return result.errors !== undefined;
      })
      .map((result) => ({
        index: result.index,
        id: result.id,
        errors: result.errors,
        details: result.details,
      }));
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

  // チケットマージ（完了まで待機）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_merges/#merge-tickets
  async mergeAndWait(
    ticketId: number,
    targetTicketId: number,
    targetComment?: string,
    sourceComment?: string,
    waitOptions?: {
      intervalMs?: number;
      timeoutMs?: number;
    }
  ): Promise<JobStatusResponse> {
    const jobResponse = await this.merge(
      ticketId,
      targetTicketId,
      targetComment,
      sourceComment
    );
    return this.waitForJobCompletion(jobResponse.job_status.id, waitOptions);
  }

  // チケットコメント一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#list-comments
  async listComments(
    ticketId: number,
    options: PaginationOptions = {}
  ): Promise<TicketCommentsResponse> {
    const params = {
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<TicketCommentsResponse>(
      `/tickets/${ticketId}/comments.json`,
      params
    );
  }

  // 特定コメント取得（コメント一覧からフィルタ）
  // Zendesk APIには個別コメント取得エンドポイントがないため、一覧から検索
  async getComment(
    ticketId: number,
    commentId: number
  ): Promise<CommentResponse> {
    const commentsResponse = await this.listComments(ticketId, {
      per_page: 100,
      sort_order: 'asc',
    });

    const comment = commentsResponse.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment ${commentId} not found in ticket ${ticketId}`);
    }

    return { comment };
  }

  // コメント編集（redaction）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#redact-comment-in-ticket
  async redactComment(
    ticketId: number,
    commentId: number,
    text: string
  ): Promise<CommentResponse> {
    return this.httpClient.put<CommentResponse>(
      `/tickets/${ticketId}/comments/${commentId}/redact.json`,
      { text }
    );
  }

  // コメント文字列を永続的に削除
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#redact-string-in-comment
  async redactStringInComment(
    ticketId: number,
    commentId: number,
    text: string
  ): Promise<void> {
    await this.httpClient.put(
      `/tickets/${ticketId}/comments/${commentId}/redact.json`,
      { text }
    );
  }

  // チケットインポート（単一）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_import/#ticket-import
  async import(ticketData: ImportTicketRequest): Promise<ImportTicketResponse> {
    return this.httpClient.post<ImportTicketResponse>('/imports/tickets.json', {
      ticket: ticketData,
    });
  }

  // チケット一括インポート
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_import/#ticket-bulk-import
  async importMany(
    ticketsData: BulkImportTicketsRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.post<JobStatusResponse>(
      '/imports/tickets/create_many.json',
      ticketsData
    );
  }

  // チケット一括インポート（完了まで待機）
  // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_import/#ticket-bulk-import
  async importManyAndWait(
    ticketsData: BulkImportTicketsRequest,
    waitOptions?: {
      intervalMs?: number;
      timeoutMs?: number;
    }
  ): Promise<JobStatusResponse> {
    const jobResponse = await this.importMany(ticketsData);
    return this.waitForJobCompletion(jobResponse.job_status.id, waitOptions);
  }
}
