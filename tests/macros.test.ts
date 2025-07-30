import { Macros } from '../src/resources/macros';
import { HttpClient } from '../src/client/HttpClient';
import {
  Macro,
  MacroResponse,
  MacrosResponse,
  MacroCategoriesResponse,
  MacroActionsResponse,
  MacroApplyResponse,
} from '../src/types/macros';

describe('Macros', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let macros: Macros;

  const mockMacro: Macro = {
    id: 123,
    title: 'Test Macro',
    active: true,
    position: 1,
    actions: [
      {
        field: 'priority',
        value: 'high',
      },
    ],
    description: 'Test macro description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usage_7d: 10,
    usage_24h: 2,
    usage_30d: 50,
    usage_1h: 1,
  };

  beforeEach(() => {
    httpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    macros = new Macros(httpClient);
  });

  describe('list', () => {
    it('マクロ一覧を取得する', async () => {
      const mockResponse: MacrosResponse = {
        macros: [mockMacro],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await macros.list();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listActive', () => {
    it('アクティブなマクロ一覧を取得する', async () => {
      const mockResponse: MacrosResponse = {
        macros: [mockMacro],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await macros.listActive();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros/active', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('search', () => {
    it('マクロを検索する', async () => {
      const mockResponse: MacrosResponse = {
        macros: [mockMacro],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const params = {
        query: 'test',
        active: true,
        sort_by: 'usage_7d' as const,
        sort_order: 'desc' as const,
      };

      const result = await macros.search(params);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros/search', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('show', () => {
    it('特定のマクロを取得する', async () => {
      const mockResponse: MacroResponse = {
        macro: mockMacro,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await macros.show(123);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('新しいマクロを作成する', async () => {
      const createRequest = {
        macro: {
          title: 'New Macro',
          active: true,
          actions: [
            {
              field: 'status',
              value: 'solved',
            },
          ],
        },
      };

      const mockResponse: MacroResponse = {
        macro: { ...mockMacro, ...createRequest.macro, id: 456 },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await macros.create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/macros', createRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('マクロを更新する', async () => {
      const updateRequest = {
        macro: {
          title: 'Updated Macro',
          active: false,
        },
      };

      const mockResponse: MacroResponse = {
        macro: { ...mockMacro, ...updateRequest.macro },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await macros.update(123, updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/macros/123', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('マクロを削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      await macros.delete(123);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/macros/123');
    });
  });

  describe('updateMany', () => {
    it('複数のマクロを一括更新する', async () => {
      const updateRequest = {
        macros: [
          { title: 'Updated Macro 1', active: true },
          { title: 'Updated Macro 2', active: false },
        ],
      };

      const mockResponse: MacrosResponse = {
        macros: [mockMacro],
        count: 2,
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await macros.updateMany(updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/macros/update_many', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('destroyMany', () => {
    it('複数のマクロを一括削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      const deleteRequest = { ids: '123,456,789' };
      await macros.destroyMany(deleteRequest);

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/macros/destroy_many?ids=123,456,789');
    });
  });

  describe('categories', () => {
    it('マクロカテゴリー一覧を取得する', async () => {
      const mockResponse: MacroCategoriesResponse = {
        categories: [
          { id: '1', name: 'Category 1', position: 1 },
          { id: '2', name: 'Category 2', position: 2 },
        ],
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await macros.categories();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros/categories');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('actions', () => {
    it('サポートされるアクション一覧を取得する', async () => {
      const mockResponse: MacroActionsResponse = {
        actions: [
          { type: 'set_priority', title: 'Set Priority' },
          { type: 'set_status', title: 'Set Status' },
        ],
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await macros.actions();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/macros/actions');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('apply', () => {
    it('マクロ適用プレビューを実行する', async () => {
      const applyRequest = {
        macro_id: 123,
        ticket_ids: [1, 2, 3],
      };

      const mockResponse: MacroApplyResponse = {
        result: {
          ticket: { id: 1, priority: 'high' },
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await macros.apply(applyRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/macros/apply', applyRequest);
      expect(result).toEqual(mockResponse);
    });
  });
});