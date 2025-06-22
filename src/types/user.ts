// User関連の型定義

export interface User {
  id: number;
  url: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
  time_zone?: string;
  iana_time_zone?: string;
  phone?: string;
  shared_phone_number?: string;
  photo?: {
    url: string;
    id: number;
    file_name: string;
    content_url: string;
    mapped_content_url: string;
    content_type: string;
    size: number;
    width: number;
    height: number;
    inline: boolean;
    deleted: boolean;
  };
  locale_id?: number;
  locale?: string;
  organization_id?: number;
  role: 'end-user' | 'agent' | 'admin';
  verified?: boolean;
  external_id?: string;
  tags?: string[];
  alias?: string;
  active?: boolean;
  shared?: boolean;
  shared_agent?: boolean;
  last_login_at?: string;
  two_factor_auth_enabled?: boolean;
  signature?: string;
  details?: string;
  notes?: string;
  role_type?: number;
  custom_role_id?: number;
  moderator?: boolean;
  ticket_restriction?:
    | 'assigned'
    | 'groups'
    | 'organization'
    | 'requested'
    | null;
  only_private_comments?: boolean;
  restricted_agent?: boolean;
  suspended?: boolean;
  default_group_id?: number;
  report_csv?: boolean;
  user_fields?: Record<string, any>;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  organization_id?: number;
  role?: User['role'];
  verified?: boolean;
  external_id?: string;
  tags?: string[];
  alias?: string;
  active?: boolean;
  phone?: string;
  time_zone?: string;
  locale_id?: number;
  user_fields?: Record<string, any>;
  details?: string;
  notes?: string;
  signature?: string;
  ticket_restriction?: User['ticket_restriction'];
  only_private_comments?: boolean;
  restricted_agent?: boolean;
  suspended?: boolean;
  default_group_id?: number;
  moderator?: boolean;
  custom_role_id?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  organization_id?: number;
  role?: User['role'];
  verified?: boolean;
  external_id?: string;
  tags?: string[];
  alias?: string;
  active?: boolean;
  phone?: string;
  time_zone?: string;
  locale_id?: number;
  user_fields?: Record<string, any>;
  details?: string;
  notes?: string;
  signature?: string;
  ticket_restriction?: User['ticket_restriction'];
  only_private_comments?: boolean;
  restricted_agent?: boolean;
  suspended?: boolean;
  default_group_id?: number;
  moderator?: boolean;
  custom_role_id?: number;
}

export interface UsersResponse {
  users: User[];
  next_page?: string;
  previous_page?: string;
  count: number;
}

export interface CursorUsersResponse {
  users: User[];
  meta: {
    has_more: boolean;
    after_cursor?: string;
    before_cursor?: string;
  };
  links: {
    prev?: string;
    next?: string;
  };
}

export interface UserResponse {
  user: User;
}

export interface BulkCreateUsersRequest {
  users: CreateUserRequest[];
}

export interface BulkUpdateUsersRequest {
  users: Array<
    {
      id: number;
    } & UpdateUserRequest
  >;
}

export interface UserIdentity {
  id: number;
  user_id: number;
  type:
    | 'email'
    | 'twitter'
    | 'facebook'
    | 'google'
    | 'phone_number'
    | 'agent_forwarding'
    | 'sdk';
  value: string;
  verified: boolean;
  primary: boolean;
  created_at: string;
  updated_at: string;
  url: string;
  deliverable_state?: 'deliverable' | 'undeliverable' | 'unknown';
  undeliverable_count?: number;
}

export interface UserIdentitiesResponse {
  identities: UserIdentity[];
}

export interface UserIdentityResponse {
  identity: UserIdentity;
}
