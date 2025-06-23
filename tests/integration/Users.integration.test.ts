import { ZendeskClient } from '../../src/client/ZendeskClient';
import { CreateUserRequest } from '../../src/types/user';
import dotenv from 'dotenv';

dotenv.config();

describe('Users Integration Tests', () => {
  let client: ZendeskClient;
  let createdUserIds: number[] = [];

  // テスト間の遅延でRate Limitを回避
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeAll(() => {
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
        rateLimitBuffer: 5 // 残り5リクエストになったら待機
      }
    });
  });

  afterAll(async () => {
    // Clean up all created users
    for (const userId of createdUserIds) {
      try {
        await client.users.delete(userId);
      } catch (error) {
        console.warn(`Failed to delete user ${userId}:`, error);
      }
    }
  });

  describe('User CRUD Operations', () => {
    test('should create a new user', async () => {
      const userData: CreateUserRequest = {
        name: 'Test User Integration',
        email: `test-user-${Date.now()}@example.com`,
        role: 'end-user'
      };

      const response = await client.users.create(userData);

      expect(response).toBeDefined();
      expect(response.user.id).toBeDefined();
      expect(response.user.name).toBe(userData.name);
      expect(response.user.email).toBe(userData.email);
      expect(response.user.role).toBe(userData.role);

      createdUserIds.push(response.user.id);
    });

    test('should get user by id', async () => {
      // First create a user
      const userData: CreateUserRequest = {
        name: 'Test User Get',
        email: `test-user-get-${Date.now()}@example.com`,
        role: 'end-user'
      };

      const createdUserResponse = await client.users.create(userData);
      createdUserIds.push(createdUserResponse.user.id);

      // Then get the user
      const userResponse = await client.users.show(createdUserResponse.user.id);

      expect(userResponse).toBeDefined();
      expect(userResponse.user.id).toBe(createdUserResponse.user.id);
      expect(userResponse.user.name).toBe(userData.name);
      expect(userResponse.user.email).toBe(userData.email);
    });

    test('should update user', async () => {
      // First create a user
      const userData: CreateUserRequest = {
        name: 'Test User Update',
        email: `test-user-update-${Date.now()}@example.com`,
        role: 'end-user'
      };

      const createdUserResponse = await client.users.create(userData);
      createdUserIds.push(createdUserResponse.user.id);

      // Update the user
      const updateData = {
        name: 'Updated Test User',
        phone: '+1234567890'
      };

      const updatedUserResponse = await client.users.update(createdUserResponse.user.id, updateData);

      expect(updatedUserResponse).toBeDefined();
      expect(updatedUserResponse.user.id).toBe(createdUserResponse.user.id);
      expect(updatedUserResponse.user.name).toBe(updateData.name);
      expect(updatedUserResponse.user.phone).toBe(updateData.phone);
    });

    test('should delete user', async () => {
      // First create a user
      const userData: CreateUserRequest = {
        name: 'Test User Delete',
        email: `test-user-delete-${Date.now()}@example.com`,
        role: 'end-user'
      };

      const createdUserResponse = await client.users.create(userData);

      // Delete the user
      await client.users.delete(createdUserResponse.user.id);

      // Verify the user is deactivated (Zendesk doesn't actually delete users, it deactivates them)
      const deactivatedUserResponse = await client.users.show(createdUserResponse.user.id);
      expect(deactivatedUserResponse.user.active).toBe(false);
    });

    test('should list users', async () => {
      const usersResponse = await client.users.list();

      expect(usersResponse).toBeDefined();
      expect(Array.isArray(usersResponse.users)).toBe(true);
      expect(usersResponse.users.length).toBeGreaterThan(0);

      // Check structure of first user
      if (usersResponse.users.length > 0) {
        const user = usersResponse.users[0];
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
      }
    });

    test('should search users by email', async () => {
      // First create a user with unique email
      const uniqueEmail = `test-search-${Date.now()}@example.com`;
      const userData: CreateUserRequest = {
        name: 'Test User Search',
        email: uniqueEmail,
        role: 'end-user'
      };

      const createdUserResponse = await client.users.create(userData);
      createdUserIds.push(createdUserResponse.user.id);

      // Wait a bit for the user to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Search for the user
      const searchResponse = await client.users.search(uniqueEmail);

      expect(searchResponse).toBeDefined();
      expect(Array.isArray(searchResponse.users)).toBe(true);
      
      const foundUser = searchResponse.users.find((user: any) => user.email === uniqueEmail);
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUserResponse.user.id);
    });

    test('should track rate limit information', async () => {
      // Make a simple request to get rate limit info
      await client.users.list();
      
      const rateLimitInfo = client.getRateLimitInfo();
      if (rateLimitInfo) {
        expect(rateLimitInfo.limit).toBeGreaterThan(0);
        expect(rateLimitInfo.remaining).toBeGreaterThanOrEqual(0);
        expect(rateLimitInfo.resetTime).toBeInstanceOf(Date);
        
        console.log(`Rate Limit - Remaining: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}, Reset: ${rateLimitInfo.resetTime.toISOString()}`);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent user', async () => {
      const nonExistentId = 999999999;
      
      await expect(client.users.show(nonExistentId)).rejects.toThrow();
    });

    test('should handle creating user with invalid data', async () => {
      const invalidUserData = {
        name: '',
        email: 'invalid-email',
        role: 'invalid-role' as any
      };

      await expect(client.users.create(invalidUserData)).rejects.toThrow();
    });

    test('should handle updating non-existent user', async () => {
      const nonExistentId = 999999999;
      const updateData = { name: 'Updated Name' };

      await expect(client.users.update(nonExistentId, updateData)).rejects.toThrow();
    });

    test('should handle deleting non-existent user', async () => {
      const nonExistentId = 999999999;

      await expect(client.users.delete(nonExistentId)).rejects.toThrow();
    });
  });
});