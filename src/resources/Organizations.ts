// Organizationsリソースクラス

import { HttpClient } from '../client/HttpClient';
import { PaginationOptions, CursorPaginationOptions } from '../types/common';
import {
  OrganizationsResponse,
  OrganizationResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CursorOrganizationsResponse,
  BulkCreateOrganizationsRequest,
  BulkUpdateOrganizationsRequest,
  OrganizationMembershipsResponse,
  OrganizationMembershipResponse,
} from '../types/organization';
import { JobStatusResponse } from '../types/ticket';

export class Organizations {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // 組織一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#list-organizations
  async list(options: PaginationOptions = {}): Promise<OrganizationsResponse> {
    const params = {
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<OrganizationsResponse>(
      '/organizations.json',
      params
    );
  }

  // cursor-based paginationで組織一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#list-organizations
  async listWithCursor(
    options: CursorPaginationOptions = {}
  ): Promise<CursorOrganizationsResponse> {
    const params: any = {
      'page[size]': options.page_size || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    if (options.cursor) {
      params['page[after]'] = options.cursor;
    }

    return this.httpClient.get<CursorOrganizationsResponse>(
      '/organizations.json',
      params
    );
  }

  // 組織詳細取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#show-organization
  async show(organizationId: number): Promise<OrganizationResponse> {
    return this.httpClient.get<OrganizationResponse>(
      `/organizations/${organizationId}.json`
    );
  }

  // 複数組織取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#show-many-organizations
  async showMany(organizationIds: number[]): Promise<OrganizationsResponse> {
    const ids = organizationIds.join(',');
    return this.httpClient.get<OrganizationsResponse>(
      `/organizations/show_many.json?ids=${ids}`
    );
  }

  // 組織作成
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#create-organization
  async create(
    organizationData: CreateOrganizationRequest
  ): Promise<OrganizationResponse> {
    return this.httpClient.post<OrganizationResponse>('/organizations.json', {
      organization: organizationData,
    });
  }

  // 組織更新
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#update-organization
  async update(
    organizationId: number,
    organizationData: UpdateOrganizationRequest
  ): Promise<OrganizationResponse> {
    return this.httpClient.put<OrganizationResponse>(
      `/organizations/${organizationId}.json`,
      {
        organization: organizationData,
      }
    );
  }

  // 組織削除
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#delete-organization
  async delete(organizationId: number): Promise<void> {
    await this.httpClient.delete(`/organizations/${organizationId}.json`);
  }

  // 一括組織作成
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#create-many-organizations
  async createMany(
    organizationsData: BulkCreateOrganizationsRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.post<JobStatusResponse>(
      '/organizations/create_many.json',
      organizationsData
    );
  }

  // 一括組織更新
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#update-many-organizations
  async updateMany(
    organizationsData: BulkUpdateOrganizationsRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.put<JobStatusResponse>(
      '/organizations/update_many.json',
      organizationsData
    );
  }

  // 一括組織削除
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#bulk-delete-organizations
  async destroyMany(organizationIds: number[]): Promise<JobStatusResponse> {
    const ids = organizationIds.join(',');
    return this.httpClient.delete<JobStatusResponse>(
      `/organizations/destroy_many.json?ids=${ids}`
    );
  }

  // 組織検索
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#search-organizations
  async search(searchParams: {
    name?: string;
    external_id?: string;
  }): Promise<OrganizationsResponse> {
    if (!searchParams.name && !searchParams.external_id) {
      throw new Error(
        'Either name or external_id must be provided for organization search'
      );
    }

    if (searchParams.name && searchParams.external_id) {
      throw new Error(
        'Cannot search by both name and external_id simultaneously'
      );
    }

    const params: Record<string, string> = {};
    if (searchParams.name) {
      params.name = searchParams.name;
    }
    if (searchParams.external_id) {
      params.external_id = searchParams.external_id;
    }

    return this.httpClient.get<OrganizationsResponse>(
      '/organizations/search.json',
      params
    );
  }

  // 組織メンバーシップ一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organization_memberships/#list-memberships
  async listMemberships(
    organizationId: number,
    options: PaginationOptions = {}
  ): Promise<OrganizationMembershipsResponse> {
    const params = {
      page: options.page || 1,
      per_page: options.per_page || 100,
    };

    return this.httpClient.get<OrganizationMembershipsResponse>(
      `/organizations/${organizationId}/organization_memberships.json`,
      params
    );
  }

  // 組織メンバーシップ詳細取得
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organization_memberships/#show-membership
  async showMembership(
    organizationId: number,
    membershipId: number
  ): Promise<OrganizationMembershipResponse> {
    return this.httpClient.get<OrganizationMembershipResponse>(
      `/organizations/${organizationId}/organization_memberships/${membershipId}.json`
    );
  }

  // 組織メンバーシップ作成
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organization_memberships/#create-membership
  async createMembership(
    organizationId: number,
    userId: number,
    isDefault: boolean = false
  ): Promise<OrganizationMembershipResponse> {
    return this.httpClient.post<OrganizationMembershipResponse>(
      `/organizations/${organizationId}/organization_memberships.json`,
      {
        organization_membership: {
          user_id: userId,
          default: isDefault,
        },
      }
    );
  }

  // 組織メンバーシップ削除
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organization_memberships/#delete-membership
  async deleteMembership(
    organizationId: number,
    membershipId: number
  ): Promise<void> {
    await this.httpClient.delete(
      `/organizations/${organizationId}/organization_memberships/${membershipId}.json`
    );
  }

  // 組織メンバーシップをデフォルトに設定
  // https://developer.zendesk.com/api-reference/ticketing/organizations/organization_memberships/#set-membership-as-default
  async setDefaultMembership(
    organizationId: number,
    membershipId: number
  ): Promise<OrganizationMembershipResponse> {
    return this.httpClient.put<OrganizationMembershipResponse>(
      `/organizations/${organizationId}/organization_memberships/${membershipId}/make_default.json`
    );
  }
}
