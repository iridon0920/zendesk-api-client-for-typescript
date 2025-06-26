// Search API のモック統合テスト（実際のAPIレスポンス形式をシミュレート）

import { Search } from '../src/resources/Search';
import { HttpClient } from '../src/client/HttpClient';
import {
  UnifiedSearchResponse,
  TicketSearchResponse,
  ExportSearchResponse,
  ExportSearchOptions,
} from '../src/types/search';
import { Ticket } from '../src/types/ticket';
import { User } from '../src/types/user';

// 実際のZendesk APIレスポンス形式に基づくモックデータ
const mockTicket: Ticket = {
  id: 1,
  url: 'https://example.zendesk.com/api/v2/tickets/1.json',
  subject: 'Test Ticket',
  status: 'open',
  priority: 'normal',
  type: 'question',
  requester_id: 123,
  submitter_id: 123,
  assignee_id: 456,
  organization_id: 789,
  group_id: 101,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  tags: ['search-test', 'api-test'],
  custom_fields: []
};

const mockUser: User = {
  id: 123,
  url: 'https://example.zendesk.com/api/v2/users/123.json',
  name: 'Test User',
  email: 'test@example.com',
  role: 'end-user',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  verified: true,
  active: true
};

// HttpClientのモック（実際のAPIレスポンス形式を返す）
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  getRateLimitInfo: jest.fn().mockReturnValue({
    limit: 700,
    remaining: 650,
    retryAfter: undefined
  }),
} as unknown as HttpClient;

describe('Search API Mock Integration Tests', () => {
  let search: Search;

  beforeEach(() => {
    search = new Search(mockHttpClient);
    jest.clearAllMocks();
  });

  describe('基本検索API（実際のレスポンス形式）', () => {
    it('統合検索が実際のレスポンス形式を返す', async () => {
      const mockResponse: UnifiedSearchResponse = {
        results: [mockTicket, mockUser],
        count: 2,
        next_page: 'https://example.zendesk.com/api/v2/search.json?page=2',
        previous_page: undefined,
        facets: {
          type: {
            ticket: 1,
            user: 1
          }
        }
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await search.search({
        query: 'test',
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: 10,
        include: ['users']
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'test',
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: 10,
        include: 'users'
      });

      expect(result).toEqual(mockResponse);
      expect(result.results).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.facets).toBeDefined();
    });

    it('チケット検索が実際のレスポンス形式を返す', async () => {
      const mockResponse: TicketSearchResponse = {
        results: [mockTicket],
        count: 1,
        next_page: undefined,
        previous_page: undefined
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await search.searchTickets({
        query: 'status:open',
        per_page: 50
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'status:open type:ticket',
        per_page: 50
      });

      expect(result).toEqual(mockResponse);
      expect(result.results[0]).toHaveProperty('subject');
      expect(result.results[0]).toHaveProperty('status');
    });
  });

  describe('エクスポート検索API（実際のレスポンス形式）', () => {
    it('基本的なエクスポート検索が実際のレスポンス形式を返す', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [mockTicket],
        count: 1,
        end_of_stream: true,
        after_cursor: undefined,
        links: {
          next: undefined
        },
        meta: {
          has_more: false,
          after_cursor: undefined
        }
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await search.exportSearch<Ticket>('status:open');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'status:open'
      });

      expect(result).toEqual(mockResponse);
      expect(result.end_of_stream).toBe(true);
      expect(result.meta).toBeDefined();
      expect(result.links).toBeDefined();
    });

    it('filter[type]パラメータ付きエクスポート検索が正しく動作する', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [mockTicket],
        count: 1,
        end_of_stream: false,
        after_cursor: 'eyJpZCI6MTIzfQ==',
        next_page: 'https://example.zendesk.com/api/v2/search/export.json?query=*&filter%5Btype%5D=ticket&page%5Bafter%5D=eyJpZCI6MTIzfQ%3D%3D',
        links: {
          next: 'https://example.zendesk.com/api/v2/search/export.json?query=*&filter%5Btype%5D=ticket&page%5Bafter%5D=eyJpZCI6MTIzfQ%3D%3D'
        },
        meta: {
          has_more: true,
          after_cursor: 'eyJpZCI6MTIzfQ=='
        }
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 100
      };

      const result = await search.exportSearch<Ticket>('*', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: '*',
        'filter[type]': 'ticket',
        'page[size]': 100
      });

      expect(result).toEqual(mockResponse);
      expect(result.end_of_stream).toBe(false);
      expect(result.after_cursor).toBeDefined();
      expect(result.meta?.has_more).toBe(true);
    });

    it('カーソルベースページネーションが正しく動作する', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [mockTicket],
        count: 1,
        end_of_stream: true,
        after_cursor: undefined,
        links: {
          next: undefined
        },
        meta: {
          has_more: false,
          after_cursor: undefined
        }
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 50,
        cursor: 'eyJpZCI6MTIzfQ=='
      };

      const result = await search.exportSearch<Ticket>('*', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: '*',
        'filter[type]': 'ticket',
        'page[size]': 50,
        'page[after]': 'eyJpZCI6MTIzfQ=='
      });

      expect(result).toEqual(mockResponse);
    });

    it('最大ページサイズ制限が正しく適用される', async () => {
      const mockResponse: ExportSearchResponse<Ticket> = {
        results: [],
        count: 0,
        end_of_stream: true
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 1500 // 上限1000を超える
      };

      await search.exportSearch<Ticket>('*', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: '*',
        'filter[type]': 'ticket',
        'page[size]': 1000 // 1000に制限される
      });
    });
  });

  describe('エラーハンドリング（実際のAPIエラー形式）', () => {
    it('400 Bad Requestエラーが正しく処理される', async () => {
      const apiError = new Error('Bad Request: Invalid query syntax');
      (apiError as any).status = 400;
      (apiError as any).response = {
        data: {
          error: 'BadRequest',
          description: 'Invalid query syntax'
        }
      };

      (mockHttpClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(
        search.search({ query: 'invalid:syntax:error' })
      ).rejects.toThrow('Bad Request: Invalid query syntax');
    });

    it('422 Unprocessable Entityエラーが正しく処理される', async () => {
      const apiError = new Error('Unprocessable Entity: Invalid filter type');
      (apiError as any).status = 422;
      (apiError as any).response = {
        data: {
          error: 'UnprocessableEntity',
          description: 'Invalid filter type'
        }
      };

      (mockHttpClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(
        search.exportSearch('*', { filter_type: 'invalid' as any })
      ).rejects.toThrow('Unprocessable Entity: Invalid filter type');
    });

    it('429 Rate Limitエラーが正しく処理される', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      (rateLimitError as any).response = {
        headers: {
          'retry-after': '60'
        },
        data: {
          error: 'TooManyRequests',
          description: 'Rate limit exceeded'
        }
      };

      (mockHttpClient.get as jest.Mock).mockRejectedValue(rateLimitError);

      await expect(
        search.search({ query: 'test' })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('実際のAPIパラメータ形式の検証', () => {
    it('Zendesk API形式のパラメータが正しく生成される', async () => {
      const mockResponse: UnifiedSearchResponse = {
        results: [],
        count: 0
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // 複雑な検索クエリでパラメータを検証
      await search.search({
        query: 'status:open priority:high type:incident created>2023-01-01',
        sort_by: 'updated_at',
        sort_order: 'desc',
        page: 3,
        per_page: 25,
        include: ['users', 'organizations', 'groups']
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search.json', {
        query: 'status:open priority:high type:incident created>2023-01-01',
        sort_by: 'updated_at',
        sort_order: 'desc',
        page: 3,
        per_page: 25,
        include: 'users,organizations,groups'
      });
    });

    it('エクスポート検索でZendesk API形式のパラメータが正しく生成される', async () => {
      const mockResponse: ExportSearchResponse<User> = {
        results: [],
        count: 0,
        end_of_stream: true
      };

      (mockHttpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const options: ExportSearchOptions = {
        filter_type: 'user',
        page_size: 250,
        cursor: 'eyJpZCI6NDU2LCJ2YWx1ZSI6IjIwMjMtMDEtMDFUMDA6MDA6MDBaIn0='
      };

      await search.exportSearch<User>('role:agent active:true', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/search/export.json', {
        query: 'role:agent active:true',
        'filter[type]': 'user',
        'page[size]': 250,
        'page[after]': 'eyJpZCI6NDU2LCJ2YWx1ZSI6IjIwMjMtMDEtMDFUMDA6MDA6MDBaIn0='
      });
    });
  });
});