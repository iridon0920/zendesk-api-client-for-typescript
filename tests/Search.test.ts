// Search API のユニットテスト

import { Search } from '../src/resources/Search';
import { HttpClient } from '../src/client/HttpClient';
import {
  UnifiedSearchResponse,
  TicketSearchResponse,
  UserSearchResponse,
  OrganizationSearchResponse,
  ExportSearchResponse,
  ExportSearchOptions,
} from '../src/types/search';
import { Ticket } from '../src/types/ticket';
import { User } from '../src/types/user';
import { Organization } from '../src/types/organization';

// HttpClientのモック
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  getRateLimitInfo: jest.fn(),
} as unknown as HttpClient;

describe('Search', () => {
  let search: Search;

  beforeEach(() => {
    search = new Search(mockHttpClient);
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('基本的な検索が正しく実行される', async () => {
      const mockResponse: UnifiedSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await search.search({ query: 'test query' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'test query',
      });
      expect(result).toEqual(mockResponse);
    });

    it('検索オプションが正しく設定される', async () => {
      const mockResponse: UnifiedSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await search.search({
        query: 'test query',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 2,
        per_page: 50,
        include: ['users', 'organizations'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'test query',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 2,
        per_page: 50,
        include: 'users,organizations',
      });
    });
  });

  describe('searchTickets', () => {
    it('チケット検索にtype:ticketフィルタが追加される', async () => {
      const mockResponse: TicketSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await search.searchTickets({ query: 'status:open' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'status:open type:ticket',
      });
    });

    it('既にtype:フィルタがある場合は追加しない', async () => {
      const mockResponse: TicketSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await search.searchTickets({ query: 'status:open type:ticket' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'status:open type:ticket',
      });
    });
  });

  describe('searchUsers', () => {
    it('ユーザー検索にtype:userフィルタが追加される', async () => {
      const mockResponse: UserSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await search.searchUsers({ query: 'role:agent' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'role:agent type:user',
      });
    });
  });

  describe('searchOrganizations', () => {
    it('組織検索にtype:organizationフィルタが追加される', async () => {
      const mockResponse: OrganizationSearchResponse = {
        results: [],
        count: 0,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await search.searchOrganizations({ query: 'name:acme' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'name:acme type:organization',
      });
    });
  });

  describe('exportSearch', () => {
    it('基本的なエクスポート検索が正しく実行される', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [],
        count: 0,
        end_of_stream: true,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await search.exportSearch<Ticket>('status:open');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'status:open',
      });
      expect(result).toEqual(mockResponse);
    });

    it('filter[type]パラメータが正しく設定される', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [],
        count: 0,
        end_of_stream: true,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 100,
      };

      await search.exportSearch<Ticket>('status:open', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'status:open',
        'filter[type]': 'ticket',
        'page[size]': 100,
      });
    });

    it('page_sizeが1000を超える場合は1000に制限される', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [],
        count: 0,
        end_of_stream: true,
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 1500, // 1000を超える値
      };

      await search.exportSearch<Ticket>('status:open', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'status:open',
        'filter[type]': 'ticket',
        'page[size]': 1000, // 1000に制限される
      });
    });

    it('カーソルベースページネーションが正しく設定される', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [],
        count: 0,
        end_of_stream: false,
        after_cursor: 'next_cursor',
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        cursor: 'current_cursor',
      };

      await search.exportSearch<Ticket>('status:open', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'status:open',
        'filter[type]': 'ticket',
        'page[after]': 'current_cursor',
      });
    });

    it('すべてのオプションが正しく設定される', async () => {
      const mockResponse: ExportSearchResponse<User> = {
        results: [],
        count: 0,
        end_of_stream: false,
        after_cursor: 'next_cursor',
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'user',
        page_size: 500,
        cursor: 'test_cursor',
      };

      await search.exportSearch<User>('role:agent', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'role:agent',
        'filter[type]': 'user',
        'page[size]': 500,
        'page[after]': 'test_cursor',
      });
    });
  });

  describe('パラメータビルダー', () => {
    it('buildSearchParamsが正しく動作する', () => {
      // プライベートメソッドのテストのため、リフレクションを使用
      const buildSearchParams = (search as any).buildSearchParams;
      
      const params = buildSearchParams({
        query: 'test',
        sort_by: 'created_at',
        sort_order: 'asc',
        page: 1,
        per_page: 50,
        include: ['users', 'organizations'],
      });

      expect(params).toEqual({
        query: 'test',
        sort_by: 'created_at',
        sort_order: 'asc',
        page: 1,
        per_page: 50,
        include: 'users,organizations',
      });
    });

    it('per_pageが100を超える場合は100に制限される', () => {
      const buildSearchParams = (search as any).buildSearchParams;
      
      const params = buildSearchParams({
        query: 'test',
        per_page: 150,
      });

      expect(params.per_page).toBe(100);
    });
  });

  describe('addTypeFilter', () => {
    it('type:フィルタが正しく追加される', () => {
      const addTypeFilter = (search as any).addTypeFilter;
      
      const result = addTypeFilter('status:open', 'ticket');
      expect(result).toBe('status:open type:ticket');
    });

    it('既存のtype:フィルタがある場合は追加しない', () => {
      const addTypeFilter = (search as any).addTypeFilter;
      
      const result = addTypeFilter('status:open type:ticket', 'ticket');
      expect(result).toBe('status:open type:ticket');
    });
  });
});