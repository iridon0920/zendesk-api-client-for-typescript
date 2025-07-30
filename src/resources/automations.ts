import { HttpClient } from '../client/HttpClient';
import { PaginationOptions } from '../types/common';
import {
  CreateAutomationRequest,
  UpdateAutomationRequest,
  AutomationResponse,
  AutomationsResponse,
  AutomationSearchParams,
  UpdateManyAutomationsRequest,
  DestroyManyAutomationsRequest,
} from '../types/automations';

export class Automations {
  constructor(private readonly client: HttpClient) {}

  // 自動化一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#list-automations
  async list(options: PaginationOptions = {}): Promise<AutomationsResponse> {
    return await this.client.get<AutomationsResponse>('/api/v2/automations', { params: options });
  }

  // アクティブな自動化一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#list-active-automations
  async listActive(options: PaginationOptions = {}): Promise<AutomationsResponse> {
    return await this.client.get<AutomationsResponse>('/api/v2/automations/active', { params: options });
  }

  // 自動化検索
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#search-automations
  async search(params: AutomationSearchParams & PaginationOptions): Promise<AutomationsResponse> {
    return await this.client.get<AutomationsResponse>('/api/v2/automations/search', { params });
  }

  // 自動化取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#show-automation
  async show(automationId: number): Promise<AutomationResponse> {
    return await this.client.get<AutomationResponse>(`/api/v2/automations/${automationId}`);
  }

  // 自動化作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#create-automation
  async create(data: CreateAutomationRequest): Promise<AutomationResponse> {
    return await this.client.post<AutomationResponse>('/api/v2/automations', data);
  }

  // 自動化更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#update-automation
  async update(automationId: number, data: UpdateAutomationRequest): Promise<AutomationResponse> {
    return await this.client.put<AutomationResponse>(`/api/v2/automations/${automationId}`, data);
  }

  // 自動化削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#delete-automation
  async delete(automationId: number): Promise<void> {
    await this.client.delete(`/api/v2/automations/${automationId}`);
  }

  // 自動化一括更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#update-many-automations
  async updateMany(data: UpdateManyAutomationsRequest): Promise<AutomationsResponse> {
    return await this.client.put<AutomationsResponse>('/api/v2/automations/update_many', data);
  }

  // 自動化一括削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/automations/#bulk-delete-automations
  async destroyMany(data: DestroyManyAutomationsRequest): Promise<void> {
    await this.client.delete(`/api/v2/automations/destroy_many?ids=${data.ids}`);
  }
}