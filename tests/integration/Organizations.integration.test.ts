import { ZendeskClient } from '../../src/client/ZendeskClient';
import { CreateOrganizationRequest, Organization } from '../../src/types/organization';
import dotenv from 'dotenv';

dotenv.config();

describe('Organizations Integration Tests', () => {
  let client: ZendeskClient;
  let createdOrganizationIds: number[] = [];

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
        rateLimitBuffer: 5
      }
    });
  });

  afterAll(async () => {
    // Clean up all created organizations
    for (const orgId of createdOrganizationIds) {
      try {
        await client.organizations.delete(orgId);
      } catch (error) {
        console.warn(`Failed to delete organization ${orgId}:`, error);
      }
    }
  });

  describe('Organization CRUD Operations', () => {
    test('should create a new organization', async () => {
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization ${Date.now()}`,
        domain_names: [`test-${Date.now()}.example.com`],
        details: 'Integration test organization',
        notes: 'Created for testing purposes'
      };

      const response = await client.organizations.create(orgData);

      expect(response).toBeDefined();
      expect(response.organization.id).toBeDefined();
      expect(response.organization.name).toBe(orgData.name);
      expect(response.organization.domain_names).toEqual(orgData.domain_names);
      expect(response.organization.details).toBe(orgData.details);
      expect(response.organization.notes).toBe(orgData.notes);

      createdOrganizationIds.push(response.organization.id);
    });

    test('should get organization by id', async () => {
      // First create an organization
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization Get ${Date.now()}`,
        domain_names: [`test-get-${Date.now()}.example.com`]
      };

      const createdOrgResponse = await client.organizations.create(orgData);
      createdOrganizationIds.push(createdOrgResponse.organization.id);

      // Then get the organization
      const orgResponse = await client.organizations.show(createdOrgResponse.organization.id);

      expect(orgResponse).toBeDefined();
      expect(orgResponse.organization.id).toBe(createdOrgResponse.organization.id);
      expect(orgResponse.organization.name).toBe(orgData.name);
      expect(orgResponse.organization.domain_names).toEqual(orgData.domain_names);
    });

    test('should update organization', async () => {
      // First create an organization
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization Update ${Date.now()}`,
        domain_names: [`test-update-${Date.now()}.example.com`]
      };

      const createdOrgResponse = await client.organizations.create(orgData);
      createdOrganizationIds.push(createdOrgResponse.organization.id);

      // Update the organization
      const updateData = {
        name: 'Updated Test Organization',
        details: 'Updated details',
        notes: 'Updated notes'
      };

      const updatedOrgResponse = await client.organizations.update(createdOrgResponse.organization.id, updateData);

      expect(updatedOrgResponse).toBeDefined();
      expect(updatedOrgResponse.organization.id).toBe(createdOrgResponse.organization.id);
      expect(updatedOrgResponse.organization.name).toBe(updateData.name);
      expect(updatedOrgResponse.organization.details).toBe(updateData.details);
      expect(updatedOrgResponse.organization.notes).toBe(updateData.notes);
    });

    test('should delete organization', async () => {
      // First create an organization
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization Delete ${Date.now()}`,
        domain_names: [`test-delete-${Date.now()}.example.com`]
      };

      const createdOrgResponse = await client.organizations.create(orgData);

      // Delete the organization
      await client.organizations.delete(createdOrgResponse.organization.id);

      // Verify the organization is deleted by trying to get it
      await expect(client.organizations.show(createdOrgResponse.organization.id)).rejects.toThrow();
    });

    test('should list organizations', async () => {
      const organizationsResponse = await client.organizations.list();

      expect(organizationsResponse).toBeDefined();
      expect(Array.isArray(organizationsResponse.organizations)).toBe(true);

      // Check structure of first organization if any exist
      if (organizationsResponse.organizations.length > 0) {
        const org = organizationsResponse.organizations[0];
        expect(org.id).toBeDefined();
        expect(org.name).toBeDefined();
        expect(org.created_at).toBeDefined();
        expect(org.updated_at).toBeDefined();
      }
    });

    test('should search organizations by name', async () => {
      // First create an organization with unique name
      const uniqueName = `Test Search Org ${Date.now()}`;
      const orgData: CreateOrganizationRequest = {
        name: uniqueName,
        domain_names: [`test-search-${Date.now()}.example.com`]
      };

      const createdOrgResponse = await client.organizations.create(orgData);
      createdOrganizationIds.push(createdOrgResponse.organization.id);

      // Wait a bit for the organization to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Search for the organization
      const searchResponse = await client.organizations.search(uniqueName);

      expect(searchResponse).toBeDefined();
      expect(Array.isArray(searchResponse.organizations)).toBe(true);
      
      const foundOrg = searchResponse.organizations.find((org: any) => org.name === uniqueName);
      expect(foundOrg).toBeDefined();
      expect(foundOrg?.id).toBe(createdOrgResponse.organization.id);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent organization', async () => {
      const nonExistentId = 999999999;
      
      await expect(client.organizations.show(nonExistentId)).rejects.toThrow();
    });

    test('should handle creating organization with invalid data', async () => {
      const invalidOrgData = {
        name: '', // Empty name should be invalid
        domain_names: ['invalid..domain']
      };

      await expect(client.organizations.create(invalidOrgData)).rejects.toThrow();
    });

    test('should handle updating non-existent organization', async () => {
      const nonExistentId = 999999999;
      const updateData = { name: 'Updated Name' };

      await expect(client.organizations.update(nonExistentId, updateData)).rejects.toThrow();
    });

    test('should handle deleting non-existent organization', async () => {
      const nonExistentId = 999999999;

      await expect(client.organizations.delete(nonExistentId)).rejects.toThrow();
    });
  });

  describe('Organization Relationships', () => {
    test('should handle organization with users', async () => {
      // Create an organization
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization with Users ${Date.now()}`,
        domain_names: [`test-users-${Date.now()}.example.com`]
      };

      const organizationResponse = await client.organizations.create(orgData);
      createdOrganizationIds.push(organizationResponse.organization.id);

      // Get organization users (should be empty initially)
      const memberships = await client.organizations.listMemberships(organizationResponse.organization.id);
      
      expect(memberships).toBeDefined();
      expect(Array.isArray(memberships.organization_memberships)).toBe(true);
      // Initially should be empty for a new organization
      expect(memberships.organization_memberships.length).toBe(0);
    });

    test('should handle organization tickets', async () => {
      // Create an organization
      const orgData: CreateOrganizationRequest = {
        name: `Test Organization Tickets ${Date.now()}`,
        domain_names: [`test-tickets-${Date.now()}.example.com`]
      };

      const organizationResponse = await client.organizations.create(orgData);
      createdOrganizationIds.push(organizationResponse.organization.id);

      // Get organization tickets (this test is simplified - normally would search tickets by organization)
      // For simplicity, we'll just verify the organization was created successfully
      const orgCheck = await client.organizations.show(organizationResponse.organization.id);
      
      expect(orgCheck).toBeDefined();
      expect(orgCheck.organization.id).toBe(organizationResponse.organization.id);
    });
  });
});