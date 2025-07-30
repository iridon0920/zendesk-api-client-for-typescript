import { Triggers } from '../src/resources/triggers';
import { HttpClient } from '../src/client/HttpClient';
import {
  TriggerResponse,
  TriggersResponse,
  Trigger,
  TriggerDefinitionsResponse,
  TriggerRevisionsResponse,
  TriggerRevisionResponse,
} from '../src/types/triggers';

describe('Triggers', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let triggers: Triggers;

  const mockTrigger: Trigger = {
    id: 123,
    title: 'Test Trigger',
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
    actions: [
      {
        field: 'priority',
        value: 'high',
      },
    ],
    description: 'Test trigger description',
    category_id: '456',
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

    triggers = new Triggers(httpClient);
  });

  describe('list', () => {
    it('トリガー一覧を取得する', async () => {
      const mockResponse: TriggersResponse = {
        triggers: [mockTrigger],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.list();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('ページネーションオプションを渡す', async () => {
      const mockResponse: TriggersResponse = {
        triggers: [mockTrigger],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const options = { page: 2, per_page: 50 };
      const result = await triggers.list(options);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers', { params: options });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listActive', () => {
    it('アクティブなトリガー一覧を取得する', async () => {
      const mockResponse: TriggersResponse = {
        triggers: [mockTrigger],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.listActive();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/active', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('search', () => {
    it('トリガーを検索する', async () => {
      const mockResponse: TriggersResponse = {
        triggers: [mockTrigger],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const params = {
        query: 'test',
        filter: { active: true },
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      const result = await triggers.search(params);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/search', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('show', () => {
    it('特定のトリガーを取得する', async () => {
      const mockResponse: TriggerResponse = {
        trigger: mockTrigger,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.show(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('新しいトリガーを作成する', async () => {
      const createRequest = {
        trigger: {
          title: 'New Trigger',
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
          actions: [
            {
              field: 'priority',
              value: 'urgent',
            },
          ],
        },
      };

      const mockResponse: TriggerResponse = {
        trigger: { ...mockTrigger, ...createRequest.trigger, id: 456 },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await triggers.create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/triggers', createRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('トリガーを更新する', async () => {
      const updateRequest = {
        trigger: {
          title: 'Updated Trigger',
          active: false,
        },
      };

      const mockResponse: TriggerResponse = {
        trigger: { ...mockTrigger, ...updateRequest.trigger },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await triggers.update(123, updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/triggers/123', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('トリガーを削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      await triggers.delete(123);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/triggers/123');
    });
  });

  describe('updateMany', () => {
    it('複数のトリガーを一括更新する', async () => {
      const updateRequest = {
        triggers: [
          { title: 'Updated Trigger 1', active: true },
          { title: 'Updated Trigger 2', active: false },
        ],
      };

      const mockResponse: TriggersResponse = {
        triggers: [mockTrigger],
        count: 2,
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await triggers.updateMany(updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/triggers/update_many', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reorder', () => {
    it('トリガーの順序を変更する', async () => {
      const reorderRequest = {
        trigger_ids: [123, 456, 789],
      };

      const mockResponse: TriggerResponse = {
        trigger: mockTrigger,
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await triggers.reorder(reorderRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/triggers/reorder', reorderRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('destroyMany', () => {
    it('複数のトリガーを一括削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      const deleteRequest = { ids: '123,456,789' };
      await triggers.destroyMany(deleteRequest);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/triggers/destroy_many?ids=123,456,789');
    });
  });

  describe('definitions', () => {
    it('トリガー定義を取得する', async () => {
      const mockResponse: TriggerDefinitionsResponse = {
        definitions: {
          conditions_all: [{ field: 'status', operators: ['is', 'is_not'] }],
          conditions_any: [{ field: 'priority', operators: ['is', 'is_not'] }],
          actions: [{ field: 'priority', values: ['low', 'normal', 'high', 'urgent'] }],
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.definitions();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/definitions');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listRevisions', () => {
    it('トリガーのリビジョン一覧を取得する', async () => {
      const mockResponse: TriggerRevisionsResponse = {
        trigger_revisions: [
          {
            id: 1,
            author_id: 999,
            created_at: '2024-01-01T00:00:00Z',
            snapshot: mockTrigger,
          },
        ],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.listRevisions(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/123/revisions', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('showRevision', () => {
    it('特定のトリガーリビジョンを取得する', async () => {
      const mockResponse: TriggerRevisionResponse = {
        trigger_revision: {
          id: 1,
          author_id: 999,
          created_at: '2024-01-01T00:00:00Z',
          snapshot: mockTrigger,
          diff: {},
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggers.showRevision(123, 1);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/triggers/123/revisions/1');
      expect(result).toEqual(mockResponse);
    });
  });
});