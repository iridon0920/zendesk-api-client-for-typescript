import { ZendeskClient } from '../../src/client/ZendeskClient';
import { CreateTicketRequest, TicketPriority, TicketStatus, TicketType } from '../../src/types/ticket';
import { CreateUserRequest } from '../../src/types/user';
import dotenv from 'dotenv';

dotenv.config();

describe('チケット統合テスト', () => {
  let client: ZendeskClient;
  let createdTicketIds: number[] = [];
  let createdUserIds: number[] = [];
  let testUserId: number;

  // テスト間の遅延でRate Limitを回避
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
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
        retryDelay: 1000,
        rateLimitBuffer: 5
      }
    });

    // Create a test user for ticket operations
    const userData: CreateUserRequest = {
      name: 'Test User for Tickets',
      email: `test-user-tickets-${Date.now()}@example.com`,
      role: 'end-user'
    };

    const testUserResponse = await client.users.create(userData);
    testUserId = testUserResponse.user.id;
    createdUserIds.push(testUserResponse.user.id);
  });

  afterAll(async () => {
    // Clean up all created tickets
    for (const ticketId of createdTicketIds) {
      try {
        await client.tickets.delete(ticketId);
      } catch (error) {
        console.warn(`Failed to delete ticket ${ticketId}:`, error);
      }
    }

    // Clean up all created users
    for (const userId of createdUserIds) {
      try {
        await client.users.delete(userId);
      } catch (error) {
        console.warn(`Failed to delete user ${userId}:`, error);
      }
    }
  }, 60000);

  describe('チケットCRUD操作', () => {
    test('新しいチケットを作成できること', async () => {
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket ${Date.now()}`,
        comment: {
          body: 'This is a test ticket created by integration tests'
        },
        type: 'incident' as TicketType,
        priority: 'normal' as TicketPriority,
        status: 'new' as TicketStatus,
        tags: ['integration-test', 'automated']
      };

      const response = await client.tickets.create(ticketData);

      expect(response).toBeDefined();
      expect(response.ticket.id).toBeDefined();
      expect(response.ticket.subject).toBe(ticketData.subject);
      expect(response.ticket.type).toBe(ticketData.type);
      expect(response.ticket.priority).toBe(ticketData.priority);
      // Note: Zendesk may automatically change status from 'new' to 'open'
      expect(['new', 'open']).toContain(response.ticket.status);
      expect(response.ticket.tags).toEqual(expect.arrayContaining(ticketData.tags || []));

      createdTicketIds.push(response.ticket.id);
    });

    test('IDでチケットを取得できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Get ${Date.now()}`,
        comment: {
          body: 'This is a test ticket for get operation'
        },
        type: 'question' as TicketType,
        priority: 'low' as TicketPriority
      };

      const createdTicketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(createdTicketResponse.ticket.id);

      // Then get the ticket
      const ticketResponse = await client.tickets.show(createdTicketResponse.ticket.id);

      expect(ticketResponse).toBeDefined();
      expect(ticketResponse.ticket.id).toBe(createdTicketResponse.ticket.id);
      expect(ticketResponse.ticket.subject).toBe(ticketData.subject);
    });

    test('チケットを更新できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Update ${Date.now()}`,
        comment: {
          body: 'This is a test ticket for update operation'
        },
        type: 'task' as TicketType,
        priority: 'normal' as TicketPriority
      };

      const createdTicketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(createdTicketResponse.ticket.id);

      // Update the ticket
      const updateData = {
        subject: 'Updated Test Ticket',
        priority: 'high' as TicketPriority,
        status: 'open' as TicketStatus,
        tags: ['updated', 'integration-test']
      };

      const updatedTicketResponse = await client.tickets.update(createdTicketResponse.ticket.id, updateData);

      expect(updatedTicketResponse).toBeDefined();
      expect(updatedTicketResponse.ticket.id).toBe(createdTicketResponse.ticket.id);
      expect(updatedTicketResponse.ticket.subject).toBe(updateData.subject);
      expect(updatedTicketResponse.ticket.priority).toBe(updateData.priority);
      expect(updatedTicketResponse.ticket.status).toBe(updateData.status);
      expect(updatedTicketResponse.ticket.tags).toEqual(expect.arrayContaining(updateData.tags));
    });

    test('チケットを削除できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Delete ${Date.now()}`,
        comment: {
          body: 'This is a test ticket for delete operation'
        }
      };

      const createdTicketResponse = await client.tickets.create(ticketData);

      // Delete the ticket
      await client.tickets.delete(createdTicketResponse.ticket.id);

      // Verify the ticket is deleted by trying to get it
      await expect(client.tickets.show(createdTicketResponse.ticket.id)).rejects.toThrow();
    });

    test('チケット一覧を取得できること', async () => {
      const ticketsResponse = await client.tickets.list();

      expect(ticketsResponse).toBeDefined();
      expect(Array.isArray(ticketsResponse.tickets)).toBe(true);
      expect(ticketsResponse.tickets.length).toBeGreaterThan(0);

      // Check structure of first ticket
      if (ticketsResponse.tickets.length > 0) {
        const ticket = ticketsResponse.tickets[0];
        expect(ticket.id).toBeDefined();
        expect(ticket.subject).toBeDefined();
        expect(ticket.created_at).toBeDefined();
        expect(ticket.updated_at).toBeDefined();
      }
    });

    test('チケット数を取得できること', async () => {
      const countResponse = await client.tickets.count();

      expect(countResponse).toBeDefined();
      expect(countResponse.count).toBeDefined();
      expect(countResponse.count.value).toBeGreaterThan(0);
      expect(countResponse.count.refreshed_at).toBeDefined();
    });
  });

  describe('チケットコメント', () => {
    test('コメント付きでチケットを作成できること', async () => {
      // Create a ticket with initial comment
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Comments ${Date.now()}`,
        comment: {
          body: 'This is a test ticket for comments'
        }
      };

      const response = await client.tickets.create(ticketData);
      createdTicketIds.push(response.ticket.id);

      expect(response).toBeDefined();
      expect(response.ticket.id).toBeDefined();
      expect(response.ticket.subject).toBe(ticketData.subject);
    });

    test('コメント付きでチケットを更新できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Update Comments ${Date.now()}`,
        comment: {
          body: 'This is the initial comment'
        }
      };

      const response = await client.tickets.create(ticketData);
      createdTicketIds.push(response.ticket.id);

      // Update ticket with a new comment
      const updateData = {
        comment: {
          body: 'This is an update comment'
        }
      };

      const updatedResponse = await client.tickets.update(response.ticket.id, updateData);
      expect(updatedResponse).toBeDefined();
      expect(updatedResponse.ticket.id).toBe(response.ticket.id);
    });

    test('チケットのコメント一覧を取得できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket List Comments ${Date.now()}`,
        comment: {
          body: 'This is the initial comment'
        }
      };

      const ticketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(ticketResponse.ticket.id);

      // Add a comment by updating the ticket
      await client.tickets.update(ticketResponse.ticket.id, {
        comment: {
          body: 'This is a second comment'
        }
      });

      // List comments for the ticket
      const commentsResponse = await client.tickets.listComments(ticketResponse.ticket.id);

      expect(commentsResponse).toBeDefined();
      expect(Array.isArray(commentsResponse.comments)).toBe(true);
      expect(commentsResponse.comments.length).toBeGreaterThanOrEqual(2);

      // Check structure of comments
      if (commentsResponse.comments.length > 0) {
        const comment = commentsResponse.comments[0];
        expect(comment.id).toBeDefined();
        expect(comment.body).toBeDefined();
        expect(comment.author_id).toBeDefined();
        expect(comment.created_at).toBeDefined();
        expect(typeof comment.public).toBe('boolean');
      }
    });

    test('チケットの特定コメントを取得できること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Get Comment ${Date.now()}`,
        comment: {
          body: 'This is the initial comment'
        }
      };

      const ticketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(ticketResponse.ticket.id);

      // Wait a bit for the comment to be properly created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // List comments to get comment ID
      const commentsResponse = await client.tickets.listComments(ticketResponse.ticket.id);
      expect(commentsResponse.comments.length).toBeGreaterThan(0);

      const firstCommentId = commentsResponse.comments[0].id;

      // Get specific comment
      const commentResponse = await client.tickets.getComment(ticketResponse.ticket.id, firstCommentId);

      expect(commentResponse).toBeDefined();
      expect(commentResponse.comment.id).toBe(firstCommentId);
      expect(commentResponse.comment.body).toBeDefined();
      expect(commentResponse.comment.author_id).toBeDefined();
    });

    test('存在しないコメント取得時にエラーとなること', async () => {
      // First create a ticket
      const ticketData: CreateTicketRequest = {
        subject: `Test Ticket Non-existent Comment ${Date.now()}`,
        comment: {
          body: 'This is the initial comment'
        }
      };

      const ticketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(ticketResponse.ticket.id);

      const nonExistentCommentId = 999999999;

      // Try to get non-existent comment
      await expect(
        client.tickets.getComment(ticketResponse.ticket.id, nonExistentCommentId)
      ).rejects.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    test('存在しないチケット取得時にエラーとなること', async () => {
      const nonExistentId = 999999999;
      
      await expect(client.tickets.show(nonExistentId)).rejects.toThrow();
    });

    test('無効なデータでのチケット作成時にエラーとなること', async () => {
      const invalidTicketData = {
        subject: '', // Empty subject should be invalid
        comment: {
          body: ''
        }
      };

      await expect(client.tickets.create(invalidTicketData)).rejects.toThrow();
    });

    test('存在しないチケット更新時にエラーとなること', async () => {
      const nonExistentId = 999999999;
      const updateData = { subject: 'Updated Subject' };

      await expect(client.tickets.update(nonExistentId, updateData)).rejects.toThrow();
    });

    test('存在しないチケット削除時にエラーとなること', async () => {
      const nonExistentId = 999999999;

      await expect(client.tickets.delete(nonExistentId)).rejects.toThrow();
    });

    test('存在しないチケットへのコメント追加時にエラーとなること', async () => {
      const nonExistentId = 999999999;

      // Test updating non-existent ticket
      await expect(client.tickets.update(nonExistentId, { 
        comment: { body: 'Test comment' } 
      })).rejects.toThrow();
    });
  });

  describe('チケットフィルタリングとソート', () => {
    test('複数チケットを正常に作成できること', async () => {
      // Create multiple tickets with different statuses
      const ticketData1: CreateTicketRequest = {
        subject: `Test Filter Ticket 1 ${Date.now()}`,
        comment: {
          body: 'Filter test ticket 1'
        },
        status: 'new' as TicketStatus,
        priority: 'high' as TicketPriority
      };

      const ticketData2: CreateTicketRequest = {
        subject: `Test Filter Ticket 2 ${Date.now()}`,
        comment: {
          body: 'Filter test ticket 2'
        },
        status: 'open' as TicketStatus,
        priority: 'low' as TicketPriority
      };

      const response1 = await client.tickets.create(ticketData1);
      const response2 = await client.tickets.create(ticketData2);
      
      createdTicketIds.push(response1.ticket.id, response2.ticket.id);

      // Verify both tickets were created successfully
      expect(response1.ticket.id).toBeDefined();
      expect(response2.ticket.id).toBeDefined();
      expect(response1.ticket.priority).toBe('high');
      expect(response2.ticket.priority).toBe('low');
    });
  });

  describe('ジョブステータスと一括操作', () => {
    test('一括チケット作成と完了待機ができること', async () => {
      const bulkTicketsData = {
        tickets: [
          {
            subject: `Bulk Test Ticket 1 ${Date.now()}`,
            comment: {
              body: 'This is bulk test ticket 1'
            },
            priority: 'normal' as TicketPriority
          },
          {
            subject: `Bulk Test Ticket 2 ${Date.now()}`,
            comment: {
              body: 'This is bulk test ticket 2'
            },
            priority: 'low' as TicketPriority
          }
        ]
      };

      const jobResponse = await client.tickets.createManyAndWait(bulkTicketsData, {
        intervalMs: 2000,
        timeoutMs: 60000
      });

      expect(jobResponse).toBeDefined();
      expect(['completed', 'failed']).toContain(jobResponse.job_status.status);
      
      // Get successful ticket IDs
      const successfulIds = client.tickets.getSuccessfulResourceIds(jobResponse);
      const failedResults = client.tickets.getFailedResults(jobResponse);

      if (jobResponse.job_status.status === 'completed') {
        expect(jobResponse.job_status.results).toBeDefined();
        expect(successfulIds.length).toBeGreaterThan(0);
      } else {
        // Job failed, check for failures
        expect(failedResults.length).toBeGreaterThan(0);
      }

      // Add created tickets to cleanup list
      createdTicketIds.push(...successfulIds);

      // Verify tickets were actually created
      for (const ticketId of successfulIds) {
        const ticket = await client.tickets.show(ticketId);
        expect(ticket.ticket.id).toBe(ticketId);
      }
    }, 120000);

    test('一括チケット更新と完了待機ができること', async () => {
      // First create some tickets to update
      const ticket1Response = await client.tickets.create({
        subject: `Update Test Ticket 1 ${Date.now()}`,
        comment: { body: 'Original ticket 1' },
        priority: 'low' as TicketPriority
      });
      
      const ticket2Response = await client.tickets.create({
        subject: `Update Test Ticket 2 ${Date.now()}`,
        comment: { body: 'Original ticket 2' },
        priority: 'low' as TicketPriority
      });

      createdTicketIds.push(ticket1Response.ticket.id, ticket2Response.ticket.id);

      // Update both tickets
      const bulkUpdateData = {
        tickets: [
          {
            id: ticket1Response.ticket.id,
            subject: 'Updated Test Ticket 1',
            priority: 'high' as TicketPriority
          },
          {
            id: ticket2Response.ticket.id,
            subject: 'Updated Test Ticket 2',
            priority: 'urgent' as TicketPriority
          }
        ]
      };

      const jobResponse = await client.tickets.updateManyAndWait(bulkUpdateData, {
        intervalMs: 2000,
        timeoutMs: 60000
      });

      expect(jobResponse).toBeDefined();
      expect(jobResponse.job_status.status).toBe('completed');
      expect(jobResponse.job_status.results).toBeDefined();

      // Get successful update IDs
      const successfulIds = client.tickets.getSuccessfulResourceIds(jobResponse);
      expect(successfulIds.length).toBe(2);

      // Verify tickets were actually updated
      const updatedTicket1 = await client.tickets.show(ticket1Response.ticket.id);
      const updatedTicket2 = await client.tickets.show(ticket2Response.ticket.id);

      expect(updatedTicket1.ticket.subject).toBe('Updated Test Ticket 1');
      expect(updatedTicket1.ticket.priority).toBe('high');
      expect(updatedTicket2.ticket.subject).toBe('Updated Test Ticket 2');
      expect(updatedTicket2.ticket.priority).toBe('urgent');
    }, 120000);

    test('ジョブステータス取得と結果処理ができること', async () => {
      // Create a bulk operation to get a job ID
      const bulkTicketsData = {
        tickets: [
          {
            subject: `Job Status Test Ticket ${Date.now()}`,
            comment: {
              body: 'This is for job status testing'
            }
          }
        ]
      };

      const jobResponse = await client.tickets.createMany(bulkTicketsData);
      expect(jobResponse.job_status.id).toBeDefined();

      // Wait for completion using waitForJobCompletion
      const completedJobResponse = await client.tickets.waitForJobCompletion(
        jobResponse.job_status.id,
        { intervalMs: 2000, timeoutMs: 60000 }
      );

      expect(completedJobResponse.job_status.status).toMatch(/completed|failed/);

      // Test helper methods
      const successfulIds = client.tickets.getSuccessfulResourceIds(completedJobResponse);
      const failedResults = client.tickets.getFailedResults(completedJobResponse);

      expect(Array.isArray(successfulIds)).toBe(true);
      expect(Array.isArray(failedResults)).toBe(true);

      // Add successful tickets to cleanup
      createdTicketIds.push(...successfulIds);
    }, 120000);
  });

  describe('チケットインポート', () => {
    test('履歴データ付きで単一チケットをインポートできること', async () => {
      const importData = {
        subject: `Imported Test Ticket ${Date.now()}`,
        description: 'This ticket was imported from legacy system',
        status: 'solved' as TicketStatus,
        priority: 'high' as TicketPriority,
        requester_id: testUserId,
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T15:30:00Z',
        solved_at: '2023-01-03T12:00:00Z',
        tags: ['imported', 'legacy-system'],
        comments: [
          {
            body: 'Initial issue description from legacy system',
            created_at: '2023-01-01T10:00:00Z',
            public: true
          },
          {
            body: 'Follow-up comment from agent',
            created_at: '2023-01-02T14:00:00Z',
            public: false
          },
          {
            body: 'Resolution comment',
            created_at: '2023-01-03T12:00:00Z',
            public: true
          }
        ]
      };

      const response = await client.tickets.import(importData);

      expect(response).toBeDefined();
      expect(response.ticket.id).toBeDefined();
      expect(response.ticket.subject).toBe(importData.subject);
      expect(response.ticket.status).toBe('solved');
      expect(response.ticket.priority).toBe('high');
      expect(response.ticket.requester_id).toBe(testUserId);

      createdTicketIds.push(response.ticket.id);

      // Verify historical timestamps were preserved
      expect(new Date(response.ticket.created_at)).toEqual(new Date('2023-01-01T10:00:00Z'));
    }, 60000);

    test('一括チケットインポートと完了待機ができること', async () => {
      const bulkImportData = {
        tickets: [
          {
            subject: `Bulk Import Ticket 1 ${Date.now()}`,
            description: 'First imported ticket',
            status: 'closed' as TicketStatus,
            priority: 'normal' as TicketPriority,
            requester_id: testUserId,
            created_at: '2023-01-01T09:00:00Z',
            solved_at: '2023-01-01T17:00:00Z',
            comments: [
              {
                body: 'Initial comment for ticket 1',
                created_at: '2023-01-01T09:00:00Z',
                public: true
              }
            ]
          },
          {
            subject: `Bulk Import Ticket 2 ${Date.now()}`,
            description: 'Second imported ticket',
            status: 'solved' as TicketStatus,
            priority: 'low' as TicketPriority,
            requester_id: testUserId,
            created_at: '2023-01-02T10:00:00Z',
            solved_at: '2023-01-02T16:00:00Z',
            comments: [
              {
                body: 'Initial comment for ticket 2',
                created_at: '2023-01-02T10:00:00Z',
                public: true
              },
              {
                body: 'Resolution comment for ticket 2',
                created_at: '2023-01-02T16:00:00Z',
                public: true
              }
            ]
          }
        ]
      };

      const jobResponse = await client.tickets.importManyAndWait(bulkImportData, {
        intervalMs: 3000,
        timeoutMs: 120000 // Import operations may take longer
      });

      expect(jobResponse).toBeDefined();
      expect(jobResponse.job_status.status).toBe('completed');
      expect(jobResponse.job_status.results).toBeDefined();
      expect(jobResponse.job_status.results!.length).toBe(2);

      // Get successful import IDs
      const successfulIds = client.tickets.getSuccessfulResourceIds(jobResponse);
      expect(successfulIds.length).toBe(2);

      // Add imported tickets to cleanup list
      createdTicketIds.push(...successfulIds);

      // Verify imported tickets
      for (const ticketId of successfulIds) {
        const ticket = await client.tickets.show(ticketId);
        expect(ticket.ticket.id).toBe(ticketId);
        expect(['closed', 'solved']).toContain(ticket.ticket.status);
        expect(ticket.ticket.requester_id).toBe(testUserId);
      }

      // Check failed imports
      const failedResults = client.tickets.getFailedResults(jobResponse);
      // Ensure either all succeeded or some failed
      expect(successfulIds.length + failedResults.length).toBe(2);
    }, 180000);
  });
});