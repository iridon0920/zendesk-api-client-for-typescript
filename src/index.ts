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
  SearchResponse,
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

// エラークラス
export {
  ZendeskError,
  ZendeskAuthenticationError,
  ZendeskRateLimitError,
} from './errors/ZendeskError';

// 認証ハンドラー
export { ApiTokenAuth } from './auth/ApiTokenAuth';
export type { AuthHandler } from './auth/ApiTokenAuth';