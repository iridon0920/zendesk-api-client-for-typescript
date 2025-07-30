// 自動化関連の型定義

// 自動化アクション
export interface AutomationAction {
  field: string;
  value: string | number | boolean | string[] | null;
}

// 自動化条件
export interface AutomationConditions {
  all?: AutomationCondition[];
  any?: AutomationCondition[];
}

// 個別の条件
export interface AutomationCondition {
  field: string;
  operator: string;
  value: string | number | boolean | string[] | null;
}

// 自動化
export interface Automation {
  id?: number;
  title: string;
  active?: boolean;
  position?: number;
  conditions: AutomationConditions;
  actions: AutomationAction[];
  raw_title?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  default?: boolean;
}

// 自動化作成リクエスト
export interface CreateAutomationRequest {
  automation: Omit<Automation, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>;
}

// 自動化更新リクエスト
export interface UpdateAutomationRequest {
  automation: Partial<Omit<Automation, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>>;
}

// 自動化レスポンス
export interface AutomationResponse {
  automation: Automation;
}

// 自動化一覧レスポンス
export interface AutomationsResponse {
  automations: Automation[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// 自動化検索パラメータ
export interface AutomationSearchParams {
  query: string;
  active?: boolean;
  sort_by?: 'alphabetical' | 'created_at' | 'updated_at' | 'position';
  sort_order?: 'asc' | 'desc';
}

// 自動化一括更新リクエスト
export interface UpdateManyAutomationsRequest {
  automations: UpdateAutomationRequest['automation'][];
}

// 自動化一括削除リクエスト
export interface DestroyManyAutomationsRequest {
  ids: string;
}