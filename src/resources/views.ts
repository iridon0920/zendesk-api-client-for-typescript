import { HttpClient } from '../client/HttpClient';
import { PaginationOptions } from '../types/common';
import {
  CreateViewRequest,
  UpdateViewRequest,
  ViewResponse,
  ViewsResponse,
  ViewCountResponse,
  ViewExecuteResponse,
  ViewTicketsResponse,
} from '../types/views';

export class Views {
  constructor(private readonly client: HttpClient) {}

  // ビュー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#list-views
  async list(options: PaginationOptions = {}): Promise<ViewsResponse> {
    return await this.client.get<ViewsResponse>('/api/v2/views', { params: options });
  }

  // ビューカウント取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#count-views
  async count(): Promise<ViewCountResponse> {
    return await this.client.get<ViewCountResponse>('/api/v2/views/count');
  }

  // ビュー取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#show-view
  async show(viewId: number): Promise<ViewResponse> {
    return await this.client.get<ViewResponse>(`/api/v2/views/${viewId}`);
  }

  // ビュー作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#create-view
  async create(data: CreateViewRequest): Promise<ViewResponse> {
    return await this.client.post<ViewResponse>('/api/v2/views', data);
  }

  // ビュー更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#update-view
  async update(viewId: number, data: UpdateViewRequest): Promise<ViewResponse> {
    return await this.client.put<ViewResponse>(`/api/v2/views/${viewId}`, data);
  }

  // ビュー削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#delete-view
  async delete(viewId: number): Promise<void> {
    await this.client.delete(`/api/v2/views/${viewId}`);
  }

  // ビュー実行
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#execute-view
  async execute(viewId: number, options: PaginationOptions = {}): Promise<ViewExecuteResponse> {
    return await this.client.get<ViewExecuteResponse>(`/api/v2/views/${viewId}/execute`, { params: options });
  }

  // ビュー内のチケット一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#list-tickets-from-a-view
  async tickets(viewId: number, options: PaginationOptions = {}): Promise<ViewTicketsResponse> {
    return await this.client.get<ViewTicketsResponse>(`/api/v2/views/${viewId}/tickets`, { params: options });
  }

  // ビュー内のチケット数取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/views/#count-tickets-in-view
  async countTickets(viewId: number): Promise<ViewCountResponse> {
    return await this.client.get<ViewCountResponse>(`/api/v2/views/${viewId}/count`);
  }
}