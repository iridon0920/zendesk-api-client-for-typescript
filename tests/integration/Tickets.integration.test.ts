import { ZendeskClient } from '../../src/client/ZendeskClient';
import { CreateTicketRequest, TicketPriority, TicketStatus, TicketType } from '../../src/types/ticket';
import { CreateUserRequest } from '../../src/types/user';
import dotenv from 'dotenv';

dotenv.config();

describe('Tickets Integration Tests', () => {
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
  });

  describe('Ticket CRUD Operations', () => {
    test('should create a new ticket', async () => {
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

    test('should get ticket by id', async () => {
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

    test('should update ticket', async () => {
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

    test('should delete ticket', async () => {
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

    test('should list tickets', async () => {
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

    test('should search tickets', async () => {
      // First create a ticket with unique subject
      const uniqueSubject = `Test Search Ticket ${Date.now()}`;
      const ticketData: CreateTicketRequest = {
        subject: uniqueSubject,
        comment: {
          body: 'This is a test ticket for search operation'
        },
        tags: ['search-test']
      };

      const createdTicketResponse = await client.tickets.create(ticketData);
      createdTicketIds.push(createdTicketResponse.ticket.id);

      // Wait a bit for the ticket to be indexed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Search for the ticket
      const searchResponse = await client.tickets.search(`subject:"${uniqueSubject}"`);

      expect(searchResponse).toBeDefined();
      expect(Array.isArray(searchResponse.results)).toBe(true);
      
      const foundTicket = searchResponse.results.find((ticket: any) => ticket.subject === uniqueSubject);
      expect(foundTicket).toBeDefined();
      expect(foundTicket?.id).toBe(createdTicketResponse.ticket.id);
    });
  });

  describe('Ticket Comments', () => {
    test('should create ticket with comment', async () => {
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

    test('should update ticket with comment', async () => {
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
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent ticket', async () => {
      const nonExistentId = 999999999;
      
      await expect(client.tickets.show(nonExistentId)).rejects.toThrow();
    });

    test('should handle creating ticket with invalid data', async () => {
      const invalidTicketData = {
        subject: '', // Empty subject should be invalid
        comment: {
          body: ''
        }
      };

      await expect(client.tickets.create(invalidTicketData)).rejects.toThrow();
    });

    test('should handle updating non-existent ticket', async () => {
      const nonExistentId = 999999999;
      const updateData = { subject: 'Updated Subject' };

      await expect(client.tickets.update(nonExistentId, updateData)).rejects.toThrow();
    });

    test('should handle deleting non-existent ticket', async () => {
      const nonExistentId = 999999999;

      await expect(client.tickets.delete(nonExistentId)).rejects.toThrow();
    });

    test('should handle updating non-existent ticket with comment', async () => {
      const nonExistentId = 999999999;

      // Test updating non-existent ticket
      await expect(client.tickets.update(nonExistentId, { 
        comment: { body: 'Test comment' } 
      })).rejects.toThrow();
    });
  });

  describe('Ticket Filtering and Sorting', () => {
    test('should create multiple tickets successfully', async () => {
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
});