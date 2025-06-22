// Organization関連の型定義

export interface Organization {
  id: number;
  url: string;
  name: string;
  shared_tickets: boolean;
  shared_comments: boolean;
  external_id?: string;
  created_at: string;
  updated_at: string;
  domain_names?: string[];
  details?: string;
  notes?: string;
  group_id?: number;
  tags?: string[];
  organization_fields?: Record<string, any>;
}

export interface CreateOrganizationRequest {
  name: string;
  shared_tickets?: boolean;
  shared_comments?: boolean;
  external_id?: string;
  domain_names?: string[];
  details?: string;
  notes?: string;
  group_id?: number;
  tags?: string[];
  organization_fields?: Record<string, any>;
}

export interface UpdateOrganizationRequest {
  name?: string;
  shared_tickets?: boolean;
  shared_comments?: boolean;
  external_id?: string;
  domain_names?: string[];
  details?: string;
  notes?: string;
  group_id?: number;
  tags?: string[];
  organization_fields?: Record<string, any>;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  next_page?: string;
  previous_page?: string;
  count: number;
}

export interface CursorOrganizationsResponse {
  organizations: Organization[];
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

export interface OrganizationResponse {
  organization: Organization;
}

export interface BulkCreateOrganizationsRequest {
  organizations: CreateOrganizationRequest[];
}

export interface BulkUpdateOrganizationsRequest {
  organizations: Array<
    {
      id: number;
    } & UpdateOrganizationRequest
  >;
}

export interface OrganizationMembership {
  id: number;
  user_id: number;
  organization_id: number;
  default: boolean;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface OrganizationMembershipsResponse {
  organization_memberships: OrganizationMembership[];
  next_page?: string;
  previous_page?: string;
  count: number;
}

export interface OrganizationMembershipResponse {
  organization_membership: OrganizationMembership;
}
