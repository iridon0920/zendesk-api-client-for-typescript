// ビュー関連の型定義

// ビューの条件
export interface ViewCondition {
  field: string;
  operator: string;
  value: string | number | boolean | string[] | null;
}

// ビューの条件セット
export interface ViewConditions {
  all?: ViewCondition[];
  any?: ViewCondition[];
}

// ビューの実行設定
export interface ViewExecution {
  columns?: ViewColumn[];
  group?: ViewGroup;
  sort?: ViewSort;
  custom_fields?: any[];
}

// ビューのカラム設定
export interface ViewColumn {
  id: string;
  title?: string;
}

// ビューのグループ設定
export interface ViewGroup {
  id: string;
  title?: string;
  order?: 'asc' | 'desc';
}

// ビューのソート設定
export interface ViewSort {
  id: string;
  order?: 'asc' | 'desc';
}

// ビューの制限設定
export interface ViewRestriction {
  type: string;
  id?: number;
  ids?: number[];
}

// ビュー
export interface View {
  id?: number;
  title: string;
  active?: boolean;
  position?: number;
  conditions?: ViewConditions;
  description?: string;
  execution?: ViewExecution;
  restriction?: ViewRestriction | null;
  raw_title?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  default?: boolean;
}

// ビュー作成リクエスト
export interface CreateViewRequest {
  view: Omit<View, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>;
}

// ビュー更新リクエスト
export interface UpdateViewRequest {
  view: Partial<Omit<View, 'id' | 'url' | 'created_at' | 'updated_at' | 'default'>>;
}

// ビューレスポンス
export interface ViewResponse {
  view: View;
}

// ビュー一覧レスポンス
export interface ViewsResponse {
  views: View[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// ビューカウントレスポンス
export interface ViewCountResponse {
  count: {
    value: number;
    refreshed_at?: string;
  };
}

// ビュー実行結果の行
export interface ViewRow {
  ticket_id: number;
  subject: string;
  requester_id: number;
  assignee_id: number | null;
  group_id: number | null;
  organization_id: number | null;
  created: string;
  updated: string;
  priority: string | null;
  status: string;
  type: string | null;
  via: string;
  [key: string]: any; // カスタムフィールドなど
}

// ビュー実行レスポンス
export interface ViewExecuteResponse {
  columns: ViewColumn[];
  rows: ViewRow[];
  next_page?: string | null;
  previous_page?: string | null;
}

// ビュー内のチケット一覧レスポンス
export interface ViewTicketsResponse {
  tickets: any[]; // Ticket型を使用する場合はimportが必要
  users?: any[];
  groups?: any[];
  organizations?: any[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}