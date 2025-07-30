import { TriggerCategories } from '../src/resources/triggerCategories';
import { HttpClient } from '../src/client/HttpClient';
import {
  TriggerCategory,
  TriggerCategoryResponse,
  TriggerCategoriesResponse,
  TriggerCategoryJobResponse,
} from '../src/types/triggerCategories';

describe('TriggerCategories', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let triggerCategories: TriggerCategories;

  const mockTriggerCategory: TriggerCategory = {
    id: '123',
    name: 'Test Category',
    position: 1,
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

    triggerCategories = new TriggerCategories(httpClient);
  });

  describe('list', () => {
    it('トリガーカテゴリー一覧を取得する', async () => {
      const mockResponse: TriggerCategoriesResponse = {
        trigger_categories: [mockTriggerCategory],
        next_page: null,
        previous_page: null,
        count: 1,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggerCategories.list();

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/trigger_categories', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('ページネーションオプションを渡す', async () => {
      const mockResponse: TriggerCategoriesResponse = {
        trigger_categories: [mockTriggerCategory],
        next_page: 'next_url',
        previous_page: null,
        count: 50,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const options = { page: 2, per_page: 25 };
      const result = await triggerCategories.list(options);

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/trigger_categories', { params: options });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('新しいトリガーカテゴリーを作成する', async () => {
      const createRequest = {
        trigger_category: {
          name: 'New Category',
          position: 2,
        },
      };

      const mockResponse: TriggerCategoryResponse = {
        trigger_category: {
          ...createRequest.trigger_category,
          id: '456',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await triggerCategories.create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/trigger_categories', createRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createBatchJob', () => {
    it('バッチジョブを作成する', async () => {
      const batchJobRequest = {
        job: {
          action: 'create',
          items: [
            { name: 'Category 1', position: 1 },
            { name: 'Category 2', position: 2 },
          ],
        },
      };

      const mockResponse: TriggerCategoryJobResponse = {
        job: {
          id: 'job-123',
          url: 'https://example.zendesk.com/api/v2/job_statuses/job-123',
          status: 'queued',
          total_steps: 2,
          progress: 0,
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await triggerCategories.createBatchJob(batchJobRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/api/v2/trigger_categories/jobs', batchJobRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('show', () => {
    it('特定のトリガーカテゴリーを取得する', async () => {
      const mockResponse: TriggerCategoryResponse = {
        trigger_category: mockTriggerCategory,
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await triggerCategories.show('123');

      expect(httpClient.get).toHaveBeenCalledWith('/api/v2/trigger_categories/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('トリガーカテゴリーを更新する', async () => {
      const updateRequest = {
        trigger_category: {
          name: 'Updated Category',
          position: 3,
        },
      };

      const mockResponse: TriggerCategoryResponse = {
        trigger_category: {
          ...mockTriggerCategory,
          ...updateRequest.trigger_category,
          updated_at: '2024-01-03T00:00:00Z',
        },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await triggerCategories.update('123', updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith('/api/v2/trigger_categories/123', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('トリガーカテゴリーを削除する', async () => {
      httpClient.delete.mockResolvedValue(undefined);

      await triggerCategories.delete('123');

      expect(httpClient.delete).toHaveBeenCalledWith('/api/v2/trigger_categories/123');
    });
  });
});