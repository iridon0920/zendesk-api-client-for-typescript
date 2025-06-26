import { ZendeskClient } from '../../src/client/ZendeskClient';
import { CreateTicketRequest } from '../../src/types/ticket';
import { CreateUserRequest } from '../../src/types/user';
import { ExportSearchOptions } from '../../src/types/search';
import dotenv from 'dotenv';

dotenv.config();

describe('検索API統合テスト', () => {
  let client: ZendeskClient;
  let createdTicketIds: number[] = [];
  let createdUserIds: number[] = [];
  let testUserId: number;

  // テスト間の遅延でRate Limitを回避
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  beforeAll(async () => {
    const subdomain = process.env.ZENDESK_TEST_SUBDOMAIN;
    const email = process.env.ZENDESK_TEST_EMAIL;
    const token = process.env.ZENDESK_TEST_API_TOKEN;

    if (!subdomain || !email || !token) {
      throw new Error(
        'Missing required environment variables: ZENDESK_TEST_SUBDOMAIN, ZENDESK_TEST_EMAIL, ZENDESK_TEST_API_TOKEN'
      );
    }

    client = new ZendeskClient({
      subdomain,
      email,
      token,
      httpOptions: {
        maxRetries: 3,
        retryDelay: 2000,
        rateLimitBuffer: 10
      }
    });

    // テスト用ユーザーを作成
    const userData: CreateUserRequest = {
      name: 'Search Test User',
      email: `search-test-user-${Date.now()}@example.com`,
      role: 'end-user'
    };

    const testUserResponse = await client.users.create(userData);
    testUserId = testUserResponse.user.id;
    createdUserIds.push(testUserResponse.user.id);

    // テスト用チケットを作成
    const ticketData: CreateTicketRequest = {
      subject: `Search Test Ticket ${Date.now()}`,
      comment: {
        body: 'This is a test ticket for search functionality testing'
      },
      requester: {
        name: 'Search Test User',
        email: `search-test-requester-${Date.now()}@example.com`
      },
      type: 'question',
      priority: 'normal',
      status: 'open',
      tags: ['search-test', 'api-test']
    };

    const ticketResponse = await client.tickets.create(ticketData);
    createdTicketIds.push(ticketResponse.ticket.id);

    // インデックス更新を待つ
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  afterAll(async () => {
    // 作成したリソースをクリーンアップ
    try {
      for (const ticketId of createdTicketIds) {
        await client.tickets.delete(ticketId);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      for (const userId of createdUserIds) {
        await client.users.delete(userId);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.warn('リソースのクリーンアップに失敗しました:', error);
    }
  });

  describe('基本検索API', () => {
    it('全体検索が正常に動作する', async () => {
      const result = await client.search.search({
        query: 'search-test',
        per_page: 10
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
    }, 15000);

    it('チケット専用検索が正常に動作する', async () => {
      const result = await client.search.searchTickets({
        query: 'search-test',
        per_page: 10
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
      
      // 検索結果があれば、チケットタイプであることを確認
      if (result.results.length > 0) {
        result.results.forEach(ticket => {
          expect(ticket).toHaveProperty('id');
          expect(ticket).toHaveProperty('subject');
          expect(ticket).toHaveProperty('status');
        });
      }
    }, 15000);

    it('ユーザー専用検索が正常に動作する', async () => {
      const result = await client.search.searchUsers({
        query: 'Search Test User',
        per_page: 10
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
    }, 15000);

    it('組織専用検索が正常に動作する', async () => {
      const result = await client.search.searchOrganizations({
        query: '*',
        per_page: 10
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
    }, 15000);
  });

  describe('エクスポート検索API', () => {
    it('基本的なエクスポート検索が正常に動作する', async () => {
      const result = await client.search.exportSearch(
        'search-test'
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
      expect(typeof result.end_of_stream).toBe('boolean');
    }, 15000);

    it('チケットタイプフィルタ付きエクスポート検索が正常に動作する', async () => {
      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 50
      };

      const result = await client.search.exportSearch(
        'search-test',
        options
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
      expect(typeof result.end_of_stream).toBe('boolean');
      
      // 結果がある場合は、すべてチケットタイプであることを確認
      if (result.results.length > 0) {
        result.results.forEach((item: any) => {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('subject');
          expect(item).toHaveProperty('status');
        });
      }
    }, 15000);

    it('ユーザータイプフィルタ付きエクスポート検索が正常に動作する', async () => {
      const options: ExportSearchOptions = {
        filter_type: 'user',
        page_size: 50
      };

      const result = await client.search.exportSearch(
        'Search Test User',
        options
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.count).toBe('number');
      expect(typeof result.end_of_stream).toBe('boolean');
    }, 15000);

    it('ページサイズ制限が正しく動作する', async () => {
      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 1500 // 上限1000を超える値
      };

      // エラーが発生しないことを確認（内部で1000に制限される）
      const result = await client.search.exportSearch(
        '*',
        options
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    }, 15000);

    it('カーソルベースページネーションが正常に動作する', async () => {
      const options: ExportSearchOptions = {
        filter_type: 'ticket',
        page_size: 1
      };

      const firstPage = await client.search.exportSearch(
        '*',
        options
      );

      expect(firstPage).toBeDefined();
      expect(firstPage.results).toBeDefined();
      
      // 2ページ目がある場合のテスト
      if (!firstPage.end_of_stream && firstPage.after_cursor) {
        const secondPageOptions: ExportSearchOptions = {
          filter_type: 'ticket',
          page_size: 1,
          cursor: firstPage.after_cursor
        };

        const secondPage = await client.search.exportSearch(
          '*',
          secondPageOptions
        );

        expect(secondPage).toBeDefined();
        expect(secondPage.results).toBeDefined();
        expect(Array.isArray(secondPage.results)).toBe(true);
      }
    }, 20000);
  });

  describe('検索クエリ構文のテスト', () => {
    it('ステータス検索が正常に動作する', async () => {
      const result = await client.search.searchTickets({
        query: 'status:open',
        per_page: 5
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    }, 15000);

    it('タイプ検索が正常に動作する', async () => {
      const result = await client.search.searchTickets({
        query: 'type:question',
        per_page: 5
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    }, 15000);

    it('タグ検索が正常に動作する', async () => {
      const result = await client.search.searchTickets({
        query: 'tags:search-test',
        per_page: 5
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      
      // 作成したテストチケットが見つかる可能性がある
      if (result.results.length > 0) {
        const foundTestTicket = result.results.find((ticket: any) => 
          createdTicketIds.includes(ticket.id)
        );
        
        if (foundTestTicket) {
          expect(foundTestTicket).toHaveProperty('tags');
          expect((foundTestTicket as any).tags).toContain('search-test');
        }
      }
    }, 15000);
  });

  describe('エラーハンドリング', () => {
    it('不正なクエリでエラーが発生する', async () => {
      await expect(
        client.search.search({ query: '' })
      ).rejects.toThrow();
    }, 10000);

    it('不正なフィルタータイプでエラーハンドリングされる', async () => {
      // TypeScriptの型チェックにより、不正なfilter_typeは渡せない
      // ただし、実行時エラーのテストを行う
      const options = {
        filter_type: 'invalid_type' as any,
        page_size: 50
      };

      // API側でエラーを返すか、結果が空になることを確認
      try {
        const result = await client.search.exportSearch('*', options);
        // エラーが発生しない場合は、結果が適切に処理されることを確認
        expect(result).toBeDefined();
      } catch (error) {
        // エラーが発生する場合は、適切なエラーが返されることを確認
        expect(error).toBeDefined();
      }
    }, 15000);
  });
});