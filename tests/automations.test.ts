import { Automations } from '../src/resources/automations';
import { HttpClient } from '../src/client/HttpClient';
import {
  Automation,
  AutomationResponse,
  AutomationsResponse,
} from '../src/types/automations';

describe('Automations', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let automations: Automations;

  const mockAutomation: Automation = {
    id: 123,
    title: 'Test Automation',
    active: true,
    position: 1,
    conditions: {
      all: [
        {
          field: 'status',
          operator: 'is',
          value: 'pending',
        },
        {
          field: 'hours_since_created',
          operator: 'greater_than',
          value: 24,
        },
      ],
      any: [],
    },
    actions: [
      {
        field: 'priority',
        value: 'high',
      },
      {
        field: 'status',
        value: 'open',
      },
    ],
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

    automations = new Automations(httpClient);
  });

  describe('list', () => {
    it('自動化一覧を取得する', async () => {
      const mockResponse: AutomationsResponse = {
        automations: [mockAutomation],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await automations.list();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/automations', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listActive', () => {
    it('アクティブな自動化一覧を取得する', async () => {
      const mockResponse: AutomationsResponse = {
        automations: [mockAutomation],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await automations.listActive();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/automations/active', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('search', () => {
    it('自動化を検索する', async () => {
      const mockResponse: AutomationsResponse = {
        automations: [mockAutomation],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const params = {
        query: 'test',
        active: true,
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      const result = await automations.search(params);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/automations/search', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('show', () => {
    it('特定の自動化を取得する', async () => {
      const mockResponse: AutomationResponse = {
        automation: mockAutomation,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await automations.show(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/automations/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('新しい自動化を作成する', async () => {
      const createRequest = {
        automation: {
          title: 'New Automation',
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

      const mockResponse: AutomationResponse = {
        automation: { ...mockAutomation, ...createRequest.automation, id: 456 },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await automations.create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/automations', createRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('自動化を更新する', async () => {
      const updateRequest = {
        automation: {
          title: 'Updated Automation',
          active: false,
        },
      };

      const mockResponse: AutomationResponse = {
        automation: { ...mockAutomation, ...updateRequest.automation },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await automations.update(123, updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/automations/123', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('自動化を削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      await automations.delete(123);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/automations/123');
    });
  });

  describe('updateMany', () => {
    it('複数の自動化を一括更新する', async () => {
      const updateRequest = {
        automations: [
          { title: 'Updated Automation 1', active: true },
          { title: 'Updated Automation 2', active: false },
        ],
      };

      const mockResponse: AutomationsResponse = {
        automations: [mockAutomation],
        count: 2,
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await automations.updateMany(updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/automations/update_many', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('destroyMany', () => {
    it('複数の自動化を一括削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      const deleteRequest = { ids: '123,456,789' };
      await automations.destroyMany(deleteRequest);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/automations/destroy_many?ids=123,456,789');
    });
  });
});