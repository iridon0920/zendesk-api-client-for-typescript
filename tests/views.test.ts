import { Views } from '../src/resources/views';
import { HttpClient } from '../src/client/HttpClient';
import {
  View,
  ViewResponse,
  ViewsResponse,
  ViewCountResponse,
  ViewExecuteResponse,
  ViewTicketsResponse,
} from '../src/types/views';

describe('Views', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let views: Views;

  const mockView: View = {
    id: 123,
    title: 'Test View',
    active: true,
    position: 1,
    conditions: {
      all: [
        {
          field: 'status',
          operator: 'is',
          value: 'open',
        },
      ],
      any: [],
    },
    description: 'Test view description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    views = new Views(httpClient);
  });

  describe('list', () => {
    it('ビュー一覧を取得する', async () => {
      const mockResponse: ViewsResponse = {
        views: [mockView],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.list();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('count', () => {
    it('ビューカウントを取得する', async () => {
      const mockResponse: ViewCountResponse = {
        count: {
          value: 10,
          refreshed_at: '2024-01-01T00:00:00Z',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.count();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views/count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('show', () => {
    it('特定のビューを取得する', async () => {
      const mockResponse: ViewResponse = {
        view: mockView,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.show(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('新しいビューを作成する', async () => {
      const createRequest = {
        view: {
          title: 'New View',
          active: true,
          conditions: {
            all: [
              {
                field: 'status',
                operator: 'is',
                value: 'new',
              },
            ],
          },
        },
      };

      const mockResponse: ViewResponse = {
        view: { ...mockView, ...createRequest.view, id: 456 },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await views.create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/views', createRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('ビューを更新する', async () => {
      const updateRequest = {
        view: {
          title: 'Updated View',
          active: false,
        },
      };

      const mockResponse: ViewResponse = {
        view: { ...mockView, ...updateRequest.view },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await views.update(123, updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/views/123', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('ビューを削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      await views.delete(123);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/views/123');
    });
  });

  describe('execute', () => {
    it('ビューを実行する', async () => {
      const mockResponse: ViewExecuteResponse = {
        columns: [
          { id: 'ticket_id', title: 'ID' },
          { id: 'subject', title: 'Subject' },
        ],
        rows: [
          {
            ticket_id: 1,
            subject: 'Test ticket',
            requester_id: 100,
            assignee_id: 200,
            group_id: 300,
            organization_id: 400,
            created: '2024-01-01T00:00:00Z',
            updated: '2024-01-01T00:00:00Z',
            priority: 'normal',
            status: 'open',
            type: 'incident',
            via: 'email',
          },
        ],
        next_page: null,
        previous_page: null,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.execute(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views/123/execute', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('tickets', () => {
    it('ビュー内のチケット一覧を取得する', async () => {
      const mockResponse: ViewTicketsResponse = {
        tickets: [{ id: 1, subject: 'Test ticket' }],
        users: [],
        groups: [],
        organizations: [],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.tickets(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views/123/tickets', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('countTickets', () => {
    it('ビュー内のチケット数を取得する', async () => {
      const mockResponse: ViewCountResponse = {
        count: {
          value: 5,
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await views.countTickets(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/views/123/count');
      expect(result).toEqual(mockResponse);
    });
  });
});