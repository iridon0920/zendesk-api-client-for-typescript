import { HttpClient } from '../client/HttpClient';
import { PaginationOptions } from '../types/common';
import {
  CreateTriggerCategoryRequest,
  UpdateTriggerCategoryRequest,
  TriggerCategoryResponse,
  TriggerCategoriesResponse,
  TriggerCategoryBatchJobRequest,
  TriggerCategoryJobResponse,
} from '../types/triggerCategories';

export class TriggerCategories {
  constructor(private readonly client: HttpClient) {}
  // トリガーカテゴリー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#list-trigger-categories
  async list(options: PaginationOptions = {}): Promise<TriggerCategoriesResponse> {
    return await this.client.get<TriggerCategoriesResponse>('/api/v2/trigger_categories', { params: options });
  }

  // トリガーカテゴリー作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#create-trigger-category
  async create(data: CreateTriggerCategoryRequest): Promise<TriggerCategoryResponse> {
    return await this.client.post<TriggerCategoryResponse>('/api/v2/trigger_categories', data);
  }

  // トリガーカテゴリーバッチジョブ作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#create-batch-job-for-trigger-categories
  async createBatchJob(data: TriggerCategoryBatchJobRequest): Promise<TriggerCategoryJobResponse> {
    return await this.client.post<TriggerCategoryJobResponse>('/api/v2/trigger_categories/jobs', data);
  }

  // トリガーカテゴリー取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#show-trigger-category
  async show(categoryId: string): Promise<TriggerCategoryResponse> {
    return await this.client.get<TriggerCategoryResponse>(`/api/v2/trigger_categories/${categoryId}`);
  }

  // トリガーカテゴリー更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#update-trigger-category
  async update(categoryId: string, data: UpdateTriggerCategoryRequest): Promise<TriggerCategoryResponse> {
    return await this.client.put<TriggerCategoryResponse>(`/api/v2/trigger_categories/${categoryId}`, data);
  }

  // トリガーカテゴリー削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/trigger_categories/#delete-trigger-category
  async delete(categoryId: string): Promise<void> {
    await this.client.delete(`/api/v2/trigger_categories/${categoryId}`);
  }
}