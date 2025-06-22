// Usersリソースクラス

import { HttpClient } from '../client/HttpClient';
import { PaginationOptions, CursorPaginationOptions } from '../types/common';
import {
  UsersResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CursorUsersResponse,
  BulkCreateUsersRequest,
  BulkUpdateUsersRequest,
  UserIdentitiesResponse,
  UserIdentityResponse,
} from '../types/user';
import { JobStatusResponse } from '../types/ticket';

export class Users {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // ユーザー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#list-users
  async list(options: PaginationOptions = {}): Promise<UsersResponse> {
    const params = {
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<UsersResponse>('/users.json', params);
  }

  // cursor-based paginationでユーザー一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#list-users
  async listWithCursor(
    options: CursorPaginationOptions = {}
  ): Promise<CursorUsersResponse> {
    const params: any = {
      'page[size]': options.page_size || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    if (options.cursor) {
      params['page[after]'] = options.cursor;
    }

    return this.httpClient.get<CursorUsersResponse>('/users.json', params);
  }

  // ユーザー詳細取得
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#show-user
  async show(userId: number): Promise<UserResponse> {
    return this.httpClient.get<UserResponse>(`/users/${userId}.json`);
  }

  // 複数ユーザー取得
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#show-many-users
  async showMany(userIds: number[]): Promise<UsersResponse> {
    const ids = userIds.join(',');
    return this.httpClient.get<UsersResponse>(
      `/users/show_many.json?ids=${ids}`
    );
  }

  // ユーザー作成
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#create-user
  async create(userData: CreateUserRequest): Promise<UserResponse> {
    return this.httpClient.post<UserResponse>('/users.json', {
      user: userData,
    });
  }

  // ユーザー更新
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#update-user
  async update(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<UserResponse> {
    return this.httpClient.put<UserResponse>(`/users/${userId}.json`, {
      user: userData,
    });
  }

  // ユーザー削除
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#delete-user
  async delete(userId: number): Promise<UserResponse> {
    return this.httpClient.delete<UserResponse>(`/users/${userId}.json`);
  }

  // 一括ユーザー作成
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#create-many-users
  async createMany(
    usersData: BulkCreateUsersRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.post<JobStatusResponse>(
      '/users/create_many.json',
      usersData
    );
  }

  // 一括ユーザー更新
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#update-many-users
  async updateMany(
    usersData: BulkUpdateUsersRequest
  ): Promise<JobStatusResponse> {
    return this.httpClient.put<JobStatusResponse>(
      '/users/update_many.json',
      usersData
    );
  }

  // 一括ユーザー削除
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#bulk-delete-users
  async destroyMany(userIds: number[]): Promise<JobStatusResponse> {
    const ids = userIds.join(',');
    return this.httpClient.delete<JobStatusResponse>(
      `/users/destroy_many.json?ids=${ids}`
    );
  }

  // ユーザー検索
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#search-users
  async search(
    query: string,
    options: PaginationOptions = {}
  ): Promise<UsersResponse> {
    const params = {
      query,
      page: options.page || 1,
      per_page: options.per_page || 100,
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
    };

    return this.httpClient.get<UsersResponse>('/users/search.json', params);
  }

  // 現在のユーザー情報取得
  // https://developer.zendesk.com/api-reference/ticketing/users/users/#show-the-currently-authenticated-user
  async me(): Promise<UserResponse> {
    return this.httpClient.get<UserResponse>('/users/me.json');
  }

  // ユーザーのアイデンティティ一覧取得
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#list-identities
  async listIdentities(userId: number): Promise<UserIdentitiesResponse> {
    return this.httpClient.get<UserIdentitiesResponse>(
      `/users/${userId}/identities.json`
    );
  }

  // ユーザーのアイデンティティ詳細取得
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#show-identity
  async showIdentity(
    userId: number,
    identityId: number
  ): Promise<UserIdentityResponse> {
    return this.httpClient.get<UserIdentityResponse>(
      `/users/${userId}/identities/${identityId}.json`
    );
  }

  // ユーザーのアイデンティティ作成
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#create-identity
  async createIdentity(
    userId: number,
    identityData: { type: string; value: string }
  ): Promise<UserIdentityResponse> {
    return this.httpClient.post<UserIdentityResponse>(
      `/users/${userId}/identities.json`,
      {
        identity: identityData,
      }
    );
  }

  // ユーザーのアイデンティティ更新
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#update-identity
  async updateIdentity(
    userId: number,
    identityId: number,
    identityData: { verified?: boolean }
  ): Promise<UserIdentityResponse> {
    return this.httpClient.put<UserIdentityResponse>(
      `/users/${userId}/identities/${identityId}.json`,
      {
        identity: identityData,
      }
    );
  }

  // ユーザーのアイデンティティ削除
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#delete-identity
  async deleteIdentity(userId: number, identityId: number): Promise<void> {
    await this.httpClient.delete(
      `/users/${userId}/identities/${identityId}.json`
    );
  }

  // ユーザーのプライマリアイデンティティ設定
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#make-identity-primary
  async makePrimaryIdentity(
    userId: number,
    identityId: number
  ): Promise<UserIdentitiesResponse> {
    return this.httpClient.put<UserIdentitiesResponse>(
      `/users/${userId}/identities/${identityId}/make_primary.json`
    );
  }

  // ユーザーのアイデンティティ検証要求
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#request-user-verification
  async requestVerification(userId: number, identityId: number): Promise<void> {
    await this.httpClient.put(
      `/users/${userId}/identities/${identityId}/request_verification.json`
    );
  }

  // ユーザーのアイデンティティ検証
  // https://developer.zendesk.com/api-reference/ticketing/users/user_identities/#verify-identity
  async verifyIdentity(
    userId: number,
    identityId: number
  ): Promise<UserIdentityResponse> {
    return this.httpClient.put<UserIdentityResponse>(
      `/users/${userId}/identities/${identityId}/verify.json`
    );
  }
}
