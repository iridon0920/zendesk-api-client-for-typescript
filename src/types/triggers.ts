// トリガー関連の型定義

// トリガーアクション
export interface TriggerAction {
  field: string;
  value: string | number | boolean | string[] | null;
}

// トリガー条件
export interface TriggerConditions {
  all?: TriggerCondition[];
  any?: TriggerCondition[];
}

// 個別の条件
export interface TriggerCondition {
  field: string;
  operator: string;
  value: string | number | boolean | string[] | null;
}

// トリガー
export interface Trigger {
  id?: number;
  title: string;
  active?: boolean;
  position?: number;
  conditions: TriggerConditions;
  actions: TriggerAction[];
  description?: string | null;
  category_id?: string | null;
  raw_title?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  default?: boolean;
}

// トリガー作成リクエスト
export interface CreateTriggerRequest {
  trigger: Omit<Trigger, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>;
}

// トリガー更新リクエスト
export interface UpdateTriggerRequest {
  trigger: Partial<Omit<Trigger, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>>;
}

// トリガーレスポンス
export interface TriggerResponse {
  trigger: Trigger;
}

// トリガー一覧レスポンス
export interface TriggersResponse {
  triggers: Trigger[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// トリガー検索パラメータ
export interface TriggerSearchParams {
  query?: string;
  filter?: {
    active?: boolean;
    category_id?: string | number;
  };
  sort_by?: 'alphabetical' | 'created_at' | 'updated_at' | 'position';
  sort_order?: 'asc' | 'desc';
}

// トリガー並び替えリクエスト
export interface TriggerReorderRequest {
  trigger_ids: number[];
}

// トリガー一括更新リクエスト
export interface UpdateManyTriggersRequest {
  triggers: UpdateTriggerRequest['trigger'][];
}

// トリガー一括削除リクエスト
export interface DestroyManyTriggersRequest {
  ids: string;
}

// トリガー定義
export interface TriggerDefinition {
  [key: string]: any;
}

// トリガー定義レスポンス
export interface TriggerDefinitionsResponse {
  definitions: {
    conditions_all: TriggerDefinition[];
    conditions_any: TriggerDefinition[];
    actions: TriggerDefinition[];
  };
}

// トリガーリビジョン
export interface TriggerRevision {
  id: number;
  author_id: number;
  created_at: string;
  diff?: any;
  snapshot?: Trigger;
}

// トリガーリビジョンレスポンス
export interface TriggerRevisionsResponse {
  trigger_revisions: TriggerRevision[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// 単一トリガーリビジョンレスポンス
export interface TriggerRevisionResponse {
  trigger_revision: TriggerRevision;
}