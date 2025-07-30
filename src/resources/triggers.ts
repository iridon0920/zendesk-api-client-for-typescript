import { HttpClient } from '../client/HttpClient';
import { PaginationOptions } from '../types/common';
import {
  CreateTriggerRequest,
  UpdateTriggerRequest,
  TriggerResponse,
  TriggersResponse,
  TriggerSearchParams,
  TriggerReorderRequest,
  UpdateManyTriggersRequest,
  DestroyManyTriggersRequest,
  TriggerDefinitionsResponse,
  TriggerRevisionsResponse,
  TriggerRevisionResponse,
} from '../types/triggers';

export class Triggers {
  constructor(private readonly client: HttpClient) {}
  // トリガー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#list-triggers
  async list(options: PaginationOptions = {}): Promise<TriggersResponse> {
    return await this.client.get<TriggersResponse>('/api/v2/triggers', { params: options });
  }

  // アクティブなトリガー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#list-active-triggers
  async listActive(options: PaginationOptions = {}): Promise<TriggersResponse> {
    return await this.client.get<TriggersResponse>('/api/v2/triggers/active', { params: options });
  }

  // トリガー検索
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#search-triggers
  async search(params: TriggerSearchParams & PaginationOptions): Promise<TriggersResponse> {
    return await this.client.get<TriggersResponse>('/api/v2/triggers/search', { params });
  }

  // トリガー取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#show-trigger
  async show(triggerId: number): Promise<TriggerResponse> {
    return await this.client.get<TriggerResponse>(`/api/v2/triggers/${triggerId}`);
  }

  // トリガー作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#create-trigger
  async create(data: CreateTriggerRequest): Promise<TriggerResponse> {
    return await this.client.post<TriggerResponse>('/api/v2/triggers', data);
  }

  // トリガー更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#update-trigger
  async update(triggerId: number, data: UpdateTriggerRequest): Promise<TriggerResponse> {
    return await this.client.put<TriggerResponse>(`/api/v2/triggers/${triggerId}`, data);
  }

  // トリガー削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#delete-trigger
  async delete(triggerId: number): Promise<void> {
    await this.client.delete(`/api/v2/triggers/${triggerId}`);
  }

  // トリガー一括更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#update-many-triggers
  async updateMany(data: UpdateManyTriggersRequest): Promise<TriggersResponse> {
    return await this.client.put<TriggersResponse>('/api/v2/triggers/update_many', data);
  }

  // トリガー並び替え
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#reorder-triggers
  async reorder(data: TriggerReorderRequest): Promise<TriggerResponse> {
    return await this.client.put<TriggerResponse>('/api/v2/triggers/reorder', data);
  }

  // トリガー一括削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#delete-triggers-in-bulk
  async destroyMany(data: DestroyManyTriggersRequest): Promise<void> {
    await this.client.delete(`/api/v2/triggers/destroy_many?ids=${data.ids}`);
  }

  // トリガー定義取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#list-trigger-action-and-condition-definitions
  async definitions(): Promise<TriggerDefinitionsResponse> {
    return await this.client.get<TriggerDefinitionsResponse>('/api/v2/triggers/definitions');
  }

  // トリガーリビジョン一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#list-trigger-revisions
  async listRevisions(triggerId: number, options: PaginationOptions = {}): Promise<TriggerRevisionsResponse> {
    return await this.client.get<TriggerRevisionsResponse>(
      `/api/v2/triggers/${triggerId}/revisions`,
      { params: options }
    );
  }

  // トリガーリビジョン取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/triggers/#show-trigger-revision
  async showRevision(triggerId: number, revisionId: number): Promise<TriggerRevisionResponse> {
    return await this.client.get<TriggerRevisionResponse>(
      `/api/v2/triggers/${triggerId}/revisions/${revisionId}`
    );
  }
}