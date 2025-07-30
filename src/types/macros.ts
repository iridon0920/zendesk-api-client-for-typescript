// マクロ関連の型定義

// マクロアクション
export interface MacroAction {
  field: string;
  value: string | number | boolean | string[] | null;
}

// マクロの制限設定
export interface MacroRestriction {
  type: string;
  id?: number;
  ids?: number[];
}

// マクロ
export interface Macro {
  id?: number;
  title: string;
  active?: boolean;
  position?: number;
  actions: MacroAction[];
  description?: string | null;
  restriction?: MacroRestriction | null;
  raw_title?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  default?: boolean;
  usage_7d?: number;
  usage_24h?: number;
  usage_30d?: number;
  usage_1h?: number;
}

// マクロ作成リクエスト
export interface CreateMacroRequest {
  macro: Omit<Macro, 'id' | 'url' | 'created_at' | 'updated_at' | 'default' | 'usage_7d' | 'usage_24h' | 'usage_30d' | 'usage_1h'>;
}

// マクロ更新リクエスト
export interface UpdateMacroRequest {
  macro: Partial<Omit<Macro, 'id' | 'url' | 'created_at' | 'updated_at' | 'default' | 'usage_7d' | 'usage_24h' | 'usage_30d' | 'usage_1h'>>;
}

// マクロレスポンス
export interface MacroResponse {
  macro: Macro;
}

// マクロ一覧レスポンス
export interface MacrosResponse {
  macros: Macro[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// マクロ検索パラメータ
export interface MacroSearchParams {
  query: string;
  active?: boolean;
  sort_by?: 'alphabetical' | 'created_at' | 'updated_at' | 'usage_1h' | 'usage_24h' | 'usage_7d' | 'usage_30d' | 'position';
  sort_order?: 'asc' | 'desc';
}

// マクロ一括更新リクエスト
export interface UpdateManyMacrosRequest {
  macros: UpdateMacroRequest['macro'][];
}

// マクロ一括削除リクエスト
export interface DestroyManyMacrosRequest {
  ids: string;
}

// マクロカテゴリー
export interface MacroCategory {
  id?: string;
  name: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

// マクロカテゴリーレスポンス
export interface MacroCategoriesResponse {
  categories: MacroCategory[];
}

// マクロアクション定義
export interface MacroActionDefinition {
  group?: string;
  nullable?: boolean;
  repeatable?: boolean;
  subject?: string;
  title?: string;
  type?: string;
  values?: Array<{
    enabled?: boolean;
    title?: string;
    value?: string;
  }>;
}

// マクロアクション定義レスポンス
export interface MacroActionsResponse {
  actions: MacroActionDefinition[];
}

// マクロ適用プレビュー
export interface MacroApplyRequest {
  macro_id: number;
  ticket_ids: number[];
}

// マクロ適用結果
export interface MacroApplyResponse {
  result: {
    ticket: any; // Ticket型を使用する場合はimportが必要
  };
}