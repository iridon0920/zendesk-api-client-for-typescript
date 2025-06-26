// Ticketsクラスの単体テスト

import { Tickets } from '../src/resources/Tickets';
import { HttpClient } from '../src/client/HttpClient';
import { 
  JobStatusResponse, 
  ImportTicketRequest, 
  ImportTicketResponse,
  BulkImportTicketsRequest,
  BulkCreateTicketsRequest,
  BulkUpdateTicketsRequest
} from '../src/types/ticket';

describe('Tickets', () => {
  let tickets: Tickets;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    tickets = new Tickets(mockHttpClient);
  });

  describe('Job Status Management', () => {
    const mockJobStatusResponse: JobStatusResponse = {
      job_status: {
        id: 'test-job-id',
        url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
        total: 5,
        progress: 5,
        status: 'completed',
        results: [
          { id: 1, index: 0, success: true, action: 'create' },
          { id: 2, index: 1, success: true, action: 'create' },
          { id: 3, index: 2, success: false, errors: 'Invalid data' },
          { id: 4, index: 3, success: true, action: 'update' },
          { id: 5, index: 4, success: true, action: 'update' }
        ]
      }
    };

    test('should get job status', async () => {
      mockHttpClient.get.mockResolvedValue(mockJobStatusResponse);

      const result = await tickets.getJobStatus('test-job-id');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/job_statuses/test-job-id.json');
      expect(result).toEqual(mockJobStatusResponse);
    });

    test('should get successful resource IDs from job status', () => {
      const successfulIds = tickets.getSuccessfulResourceIds(mockJobStatusResponse);

      expect(successfulIds).toEqual([1, 2, 4, 5]);
    });

    test('should get failed results from job status', () => {
      const failedResults = tickets.getFailedResults(mockJobStatusResponse);

      expect(failedResults).toEqual([
        {
          index: 2,
          id: 3,
          errors: 'Invalid data',
          details: undefined
        }
      ]);
    });

    test('should handle job status with no results', () => {
      const emptyJobStatusResponse: JobStatusResponse = {
        job_status: {
          id: 'test-job-id',
          url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
          total: 0,
          progress: 0,
          status: 'completed'
        }
      };

      const successfulIds = tickets.getSuccessfulResourceIds(emptyJobStatusResponse);
      const failedResults = tickets.getFailedResults(emptyJobStatusResponse);

      expect(successfulIds).toEqual([]);
      expect(failedResults).toEqual([]);
    });

    test('should handle actual Zendesk API response format (without success field)', () => {
      const actualZendeskResponse: JobStatusResponse = {
        job_status: {
          id: 'V3-8dbe5599ba28c596dbd37b3a12dcdc15',
          url: 'https://test.zendesk.com/api/v2/job_statuses/V3-8dbe5599ba28c596dbd37b3a12dcdc15.json',
          total: 2,
          progress: 2,
          status: 'completed',
          results: [
            { id: 995, index: 0 },
            { id: 994, index: 1 }
          ]
        }
      };

      const successfulIds = tickets.getSuccessfulResourceIds(actualZendeskResponse);
      const failedResults = tickets.getFailedResults(actualZendeskResponse);

      expect(successfulIds).toEqual([995, 994]);
      expect(failedResults).toEqual([]);
    });

    test('should wait for job completion successfully', async () => {
      const inProgressResponse: JobStatusResponse = {
        job_status: {
          id: 'test-job-id',
          url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
          total: 5,
          progress: 3,
          status: 'working'
        }
      };

      mockHttpClient.get
        .mockResolvedValueOnce(inProgressResponse)
        .mockResolvedValueOnce(mockJobStatusResponse);

      const result = await tickets.waitForJobCompletion('test-job-id', {
        intervalMs: 100,
        timeoutMs: 5000
      });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockJobStatusResponse);
    });

    test('should timeout when job does not complete', async () => {
      const inProgressResponse: JobStatusResponse = {
        job_status: {
          id: 'test-job-id',
          url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
          total: 5,
          progress: 3,
          status: 'working'
        }
      };

      mockHttpClient.get.mockResolvedValue(inProgressResponse);

      await expect(tickets.waitForJobCompletion('test-job-id', {
        intervalMs: 100,
        timeoutMs: 300
      })).rejects.toThrow('Job test-job-id did not complete within 300ms');
    });

    test('should handle failed job status', async () => {
      const failedResponse: JobStatusResponse = {
        job_status: {
          id: 'test-job-id',
          url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
          total: 5,
          progress: 3,
          status: 'failed',
          message: 'Job failed due to invalid data'
        }
      };

      mockHttpClient.get.mockResolvedValue(failedResponse);

      const result = await tickets.waitForJobCompletion('test-job-id', {
        intervalMs: 100,
        timeoutMs: 5000
      });

      expect(result).toEqual(failedResponse);
    });
  });

  describe('Bulk Operations with Wait', () => {
    const mockBulkCreateRequest: BulkCreateTicketsRequest = {
      tickets: [
        {
          subject: 'Test Ticket 1',
          comment: { body: 'Test body 1' }
        },
        {
          subject: 'Test Ticket 2',
          comment: { body: 'Test body 2' }
        }
      ]
    };

    const mockBulkUpdateRequest: BulkUpdateTicketsRequest = {
      tickets: [
        {
          id: 1,
          subject: 'Updated Ticket 1'
        },
        {
          id: 2,
          subject: 'Updated Ticket 2'
        }
      ]
    };

    const mockJobResponse: JobStatusResponse = {
      job_status: {
        id: 'test-job-id',
        url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
        total: 2,
        progress: 0,
        status: 'queued'
      }
    };

    const mockCompletedJobResponse: JobStatusResponse = {
      job_status: {
        id: 'test-job-id',
        url: 'https://test.zendesk.com/api/v2/job_statuses/test-job-id.json',
        total: 2,
        progress: 2,
        status: 'completed',
        results: [
          { id: 1, index: 0, success: true, action: 'create' },
          { id: 2, index: 1, success: true, action: 'create' }
        ]
      }
    };

    test('should create many tickets and wait for completion', async () => {
      mockHttpClient.post.mockResolvedValue(mockJobResponse);
      mockHttpClient.get.mockResolvedValue(mockCompletedJobResponse);

      const result = await tickets.createManyAndWait(mockBulkCreateRequest, {
        intervalMs: 100,
        timeoutMs: 5000
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/tickets/create_many.json', mockBulkCreateRequest);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/job_statuses/test-job-id.json');
      expect(result).toEqual(mockCompletedJobResponse);
    });

    test('should update many tickets and wait for completion', async () => {
      mockHttpClient.put.mockResolvedValue(mockJobResponse);
      mockHttpClient.get.mockResolvedValue(mockCompletedJobResponse);

      const result = await tickets.updateManyAndWait(mockBulkUpdateRequest, {
        intervalMs: 100,
        timeoutMs: 5000
      });

      expect(mockHttpClient.put).toHaveBeenCalledWith('/tickets/update_many.json', mockBulkUpdateRequest);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/job_statuses/test-job-id.json');
      expect(result).toEqual(mockCompletedJobResponse);
    });

    test('should merge tickets and wait for completion', async () => {
      mockHttpClient.post.mockResolvedValue(mockJobResponse);
      mockHttpClient.get.mockResolvedValue(mockCompletedJobResponse);

      const result = await tickets.mergeAndWait(
        123,
        456,
        'Target comment',
        'Source comment',
        { intervalMs: 100, timeoutMs: 5000 }
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith('/tickets/123/merge.json', {
        ids: [456],
        target_comment: 'Target comment',
        source_comment: 'Source comment'
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/job_statuses/test-job-id.json');
      expect(result).toEqual(mockCompletedJobResponse);
    });
  });

  describe('Ticket Import', () => {
    const mockImportTicketRequest: ImportTicketRequest = {
      subject: 'Imported Test Ticket',
      description: 'This is an imported ticket',
      status: 'closed',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      solved_at: '2023-01-03T00:00:00Z',
      comments: [
        {
          body: 'Initial comment',
          created_at: '2023-01-01T00:00:00Z',
          public: true
        },
        {
          body: 'Follow-up comment',
          created_at: '2023-01-02T00:00:00Z',
          public: false
        }
      ],
      archive_immediately: true
    };

    const mockImportTicketResponse: ImportTicketResponse = {
      ticket: {
        id: 123,
        url: 'https://test.zendesk.com/api/v2/tickets/123.json',
        subject: 'Imported Test Ticket',
        status: 'closed',
        requester_id: 456,
        submitter_id: 789,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      }
    };

    const mockBulkImportRequest: BulkImportTicketsRequest = {
      tickets: [
        {
          subject: 'Imported Ticket 1',
          description: 'First imported ticket',
          status: 'closed',
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          subject: 'Imported Ticket 2',
          description: 'Second imported ticket',
          status: 'solved',
          created_at: '2023-01-02T00:00:00Z'
        }
      ]
    };

    const mockBulkImportJobResponse: JobStatusResponse = {
      job_status: {
        id: 'import-job-id',
        url: 'https://test.zendesk.com/api/v2/job_statuses/import-job-id.json',
        total: 2,
        progress: 0,
        status: 'queued'
      }
    };

    const mockBulkImportCompletedResponse: JobStatusResponse = {
      job_status: {
        id: 'import-job-id',
        url: 'https://test.zendesk.com/api/v2/job_statuses/import-job-id.json',
        total: 2,
        progress: 2,
        status: 'completed',
        results: [
          { id: 100, index: 0, success: true, action: 'import' },
          { id: 101, index: 1, success: true, action: 'import' }
        ]
      }
    };

    test('should import single ticket', async () => {
      mockHttpClient.post.mockResolvedValue(mockImportTicketResponse);

      const result = await tickets.import(mockImportTicketRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/imports/tickets.json', {
        ticket: mockImportTicketRequest
      });
      expect(result).toEqual(mockImportTicketResponse);
    });

    test('should import many tickets', async () => {
      mockHttpClient.post.mockResolvedValue(mockBulkImportJobResponse);

      const result = await tickets.importMany(mockBulkImportRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/imports/tickets/create_many.json', mockBulkImportRequest);
      expect(result).toEqual(mockBulkImportJobResponse);
    });

    test('should import many tickets and wait for completion', async () => {
      mockHttpClient.post.mockResolvedValue(mockBulkImportJobResponse);
      mockHttpClient.get.mockResolvedValue(mockBulkImportCompletedResponse);

      const result = await tickets.importManyAndWait(mockBulkImportRequest, {
        intervalMs: 100,
        timeoutMs: 5000
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/imports/tickets/create_many.json', mockBulkImportRequest);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/job_statuses/import-job-id.json');
      expect(result).toEqual(mockBulkImportCompletedResponse);
    });
  });
});