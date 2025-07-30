import { HttpClient } from '../client/HttpClient';
import { PaginationOptions } from '../types/common';
import {
  CreateMacroRequest,
  UpdateMacroRequest,
  MacroResponse,
  MacrosResponse,
  MacroSearchParams,
  UpdateManyMacrosRequest,
  DestroyManyMacrosRequest,
  MacroCategoriesResponse,
  MacroActionsResponse,
  MacroApplyRequest,
  MacroApplyResponse,
} from '../types/macros';

export class Macros {
  constructor(private readonly client: HttpClient) {}

  // マクロ一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#list-macros
  async list(options: PaginationOptions = {}): Promise<MacrosResponse> {
    return await this.client.get<MacrosResponse>('/api/v2/macros', { params: options });
  }

  // アクティブなマクロ一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#list-active-macros
  async listActive(options: PaginationOptions = {}): Promise<MacrosResponse> {
    return await this.client.get<MacrosResponse>('/api/v2/macros/active', { params: options });
  }

  // マクロ検索
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#search-macros
  async search(params: MacroSearchParams & PaginationOptions): Promise<MacrosResponse> {
    return await this.client.get<MacrosResponse>('/api/v2/macros/search', { params });
  }

  // マクロ取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#show-macro
  async show(macroId: number): Promise<MacroResponse> {
    return await this.client.get<MacroResponse>(`/api/v2/macros/${macroId}`);
  }

  // マクロ作成
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#create-macro
  async create(data: CreateMacroRequest): Promise<MacroResponse> {
    return await this.client.post<MacroResponse>('/api/v2/macros', data);
  }

  // マクロ更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#update-macro
  async update(macroId: number, data: UpdateMacroRequest): Promise<MacroResponse> {
    return await this.client.put<MacroResponse>(`/api/v2/macros/${macroId}`, data);
  }

  // マクロ削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#delete-macro
  async delete(macroId: number): Promise<void> {
    await this.client.delete(`/api/v2/macros/${macroId}`);
  }

  // マクロ一括更新
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#update-many-macros
  async updateMany(data: UpdateManyMacrosRequest): Promise<MacrosResponse> {
    return await this.client.put<MacrosResponse>('/api/v2/macros/update_many', data);
  }

  // マクロ一括削除
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#bulk-delete-macros
  async destroyMany(data: DestroyManyMacrosRequest): Promise<void> {
    await this.client.delete(`/api/v2/macros/destroy_many?ids=${data.ids}`);
  }

  // マクロカテゴリー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#list-macro-categories
  async categories(): Promise<MacroCategoriesResponse> {
    return await this.client.get<MacroCategoriesResponse>('/api/v2/macros/categories');
  }

  // サポートされるアクション一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#list-supported-actions-for-macros
  async actions(): Promise<MacroActionsResponse> {
    return await this.client.get<MacroActionsResponse>('/api/v2/macros/actions');
  }

  // マクロ適用プレビュー
  // https://developer.zendesk.com/api-reference/ticketing/business-rules/macros/#show-changes-to-ticket
  async apply(data: MacroApplyRequest): Promise<MacroApplyResponse> {
    return await this.client.post<MacroApplyResponse>('/api/v2/macros/apply', data);
  }
}