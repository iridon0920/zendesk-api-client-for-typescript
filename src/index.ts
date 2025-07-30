// メインエクスポートファイル

// メインクライアント
export { ZendeskClient } from './client/ZendeskClient';

// 型定義
export type { ZendeskConfig, ApiResponse, PaginationOptions, CursorPaginationOptions } from './types/common';
export type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketsResponse,
  TicketResponse,
  CountResponse,
  CursorTicketsResponse,
  BulkCreateTicketsRequest,
  BulkUpdateTicketsRequest,
  JobStatusResponse,
} from './types/ticket';
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserResponse,
  CursorUsersResponse,
  BulkCreateUsersRequest,
  BulkUpdateUsersRequest,
  UserIdentity,
  UserIdentitiesResponse,
  UserIdentityResponse,
} from './types/user';
export type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationsResponse,
  OrganizationResponse,
  CursorOrganizationsResponse,
  BulkCreateOrganizationsRequest,
  BulkUpdateOrganizationsRequest,
  OrganizationMembership,
  OrganizationMembershipsResponse,
  OrganizationMembershipResponse,
} from './types/organization';
export type {
  SearchOptions,
  BulkSearchOptions,
  UnifiedSearchResponse,
  TicketSearchResponse,
  UserSearchResponse,
  OrganizationSearchResponse,
  ExportSearchResponse,
  SearchProgress,
  SearchError,
} from './types/search';
export type {
  Trigger,
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
  TriggerAction,
  TriggerConditions,
  TriggerCondition,
  TriggerDefinition,
  TriggerRevision,
} from './types/triggers';
export type {
  TriggerCategory,
  CreateTriggerCategoryRequest,
  UpdateTriggerCategoryRequest,
  TriggerCategoryResponse,
  TriggerCategoriesResponse,
  TriggerCategoryBatchJobRequest,
  TriggerCategoryJobResponse,
} from './types/triggerCategories';
export type {
  View,
  CreateViewRequest,
  UpdateViewRequest,
  ViewResponse,
  ViewsResponse,
  ViewCountResponse,
  ViewExecuteResponse,
  ViewTicketsResponse,
  ViewCondition,
  ViewConditions,
  ViewExecution,
  ViewColumn,
  ViewGroup,
  ViewSort,
  ViewRestriction,
  ViewRow,
} from './types/views';
export type {
  Macro,
  CreateMacroRequest,
  UpdateMacroRequest,
  MacroResponse,
  MacrosResponse,
  MacroSearchParams,
  UpdateManyMacrosRequest,
  DestroyManyMacrosRequest,
  MacroAction,
  MacroRestriction,
  MacroCategory,
  MacroCategoriesResponse,
  MacroActionDefinition,
  MacroActionsResponse,
  MacroApplyRequest,
  MacroApplyResponse,
} from './types/macros';
export type {
  Automation,
  CreateAutomationRequest,
  UpdateAutomationRequest,
  AutomationResponse,
  AutomationsResponse,
  AutomationSearchParams,
  UpdateManyAutomationsRequest,
  DestroyManyAutomationsRequest,
  AutomationAction,
  AutomationConditions,
  AutomationCondition,
} from './types/automations';

// エラークラス
export {
  ZendeskError,
  ZendeskAuthenticationError,
  ZendeskRateLimitError,
} from './errors/ZendeskError';

// 認証ハンドラー
export { ApiTokenAuth } from './auth/ApiTokenAuth';
export type { AuthHandler } from './auth/ApiTokenAuth';

// リソースクラス
export { Triggers } from './resources/triggers';
export { TriggerCategories } from './resources/triggerCategories';
export { Views } from './resources/views';
export { Macros } from './resources/macros';
export { Automations } from './resources/automations';