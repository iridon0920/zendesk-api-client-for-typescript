# Integration Tests

This document explains how to run the integration tests for the Zendesk API TypeScript client.

## Prerequisites

1. You need a Zendesk account with API access
2. You need to generate an API token from your Zendesk admin panel
3. Node.js and npm should be installed

## Setup

1. Copy the environment configuration file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in your Zendesk test environment credentials:
   ```
   # For production use
   ZENDESK_SUBDOMAIN=your-subdomain
   ZENDESK_EMAIL=your-email@example.com
   ZENDESK_API_TOKEN=your-api-token
   
   # For integration tests (use test/sandbox environment)
   ZENDESK_TEST_SUBDOMAIN=your-test-subdomain
   ZENDESK_TEST_EMAIL=your-test-email@example.com
   ZENDESK_TEST_API_TOKEN=your-test-api-token
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running Integration Tests

To run all integration tests:
```bash
npm run test:integration
```

To run specific integration test files:
```bash
# Users API tests
npx jest tests/integration/Users.integration.test.ts

# Organizations API tests
npx jest tests/integration/Organizations.integration.test.ts

# Tickets API tests
npx jest tests/integration/Tickets.integration.test.ts
```

## Test Features

### Automatic Cleanup
All integration tests include automatic cleanup to ensure no test data remains in your Zendesk instance:

- **Users Tests**: Creates test users and deletes them after tests complete
- **Organizations Tests**: Creates test organizations and deletes them after tests complete  
- **Tickets Tests**: Creates test tickets and users, then deletes them after tests complete

### Test Coverage

#### Users API (`Users.integration.test.ts`)
- ✅ Create user
- ✅ Get user by ID
- ✅ Update user
- ✅ Delete user
- ✅ List users
- ✅ Search users by email
- ✅ Error handling for invalid operations

#### Organizations API (`Organizations.integration.test.ts`)
- ✅ Create organization
- ✅ Get organization by ID
- ✅ Update organization
- ✅ Delete organization
- ✅ List organizations
- ✅ Search organizations by name
- ✅ Get organization users
- ✅ Get organization tickets
- ✅ Error handling for invalid operations

#### Tickets API (`Tickets.integration.test.ts`)
- ✅ Create ticket
- ✅ Get ticket by ID
- ✅ Update ticket
- ✅ Delete ticket
- ✅ List tickets
- ✅ Search tickets
- ✅ Add comments to tickets
- ✅ Get ticket comments
- ✅ Filter tickets by requester
- ✅ Error handling for invalid operations

## Important Notes

⚠️ **Warning**: These tests will create and delete real data in your Zendesk instance. While all tests include cleanup logic, use a test/development Zendesk instance when possible.

🕐 **Timing**: Some tests include delays to account for Zendesk's search indexing. This is normal and ensures reliable test results.

🧹 **Cleanup**: If tests fail unexpectedly, some test data might remain. Check your Zendesk instance and manually clean up any test records if needed.

⚡ **Rate Limiting**: The client includes automatic rate limit handling:
- Monitors Zendesk rate limit headers
- Automatically retries with exponential backoff on 429 errors
- Proactively waits when approaching rate limits
- 500ms delay between integration tests to prevent overwhelming the API

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ZENDESK_SUBDOMAIN` | Your production Zendesk subdomain (without .zendesk.com) | For production |
| `ZENDESK_EMAIL` | Email address for production Zendesk account | For production |
| `ZENDESK_API_TOKEN` | API token for production Zendesk account | For production |
| `ZENDESK_TEST_SUBDOMAIN` | Your test/sandbox Zendesk subdomain | For tests |
| `ZENDESK_TEST_EMAIL` | Email address for test Zendesk account | For tests |
| `ZENDESK_TEST_API_TOKEN` | API token for test Zendesk account | For tests |

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your credentials in the `.env` file
2. **Rate Limiting**: Zendesk API has rate limits. Tests include reasonable delays but you may need to wait between test runs
3. **Permission Errors**: Ensure your API token has sufficient permissions for the operations being tested
4. **Network Errors**: Check your internet connection and Zendesk service status

### Test Data Conflicts

If you see errors related to duplicate data:
- Email addresses and organization domain names must be unique
- Tests use timestamps to generate unique values, but rapid test runs might cause conflicts
- Wait a moment and retry the tests