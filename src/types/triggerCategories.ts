// トリガーカテゴリー関連の型定義

// トリガーカテゴリー
export interface TriggerCategory {
  id?: string;
  name: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

// トリガーカテゴリー作成リクエスト
export interface CreateTriggerCategoryRequest {
  trigger_category: Omit<TriggerCategory, 'id' | 'created_at' | 'updated_at'>;
}

// トリガーカテゴリー更新リクエスト
export interface UpdateTriggerCategoryRequest {
  trigger_category: Partial<Omit<TriggerCategory, 'id' | 'created_at' | 'updated_at'>>;
}

// トリガーカテゴリーレスポンス
export interface TriggerCategoryResponse {
  trigger_category: TriggerCategory;
}

// トリガーカテゴリー一覧レスポンス
export interface TriggerCategoriesResponse {
  trigger_categories: TriggerCategory[];
  next_page?: string | null;
  previous_page?: string | null;
  count?: number;
}

// トリガーカテゴリーバッチジョブリクエスト
export interface TriggerCategoryBatchJobRequest {
  job: {
    action: string;
    items: any[];
  };
}

// ジョブステータスレスポンス
export interface TriggerCategoryJobResponse {
  job: {
    id: string;
    url: string;
    status: string;
    total_steps: number;
    progress: number;
    message?: string;
    results?: any;
  };
}