# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a TypeScript client library for the Zendesk API, providing type-safe access to Zendesk's REST API endpoints.

## Development Commands
```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- <test-file-pattern>

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Publish to npm
npm run prepublishOnly
npm publish
```

## Project Architecture

### Core Structure
- `src/` - Source code
  - `client/` - Main API client and HTTP layer
  - `resources/` - API resource classes (tickets, users, organizations, etc.)
  - `types/` - TypeScript type definitions for Zendesk API models
  - `auth/` - Authentication handlers (API token, OAuth)
  - `utils/` - Utility functions and helpers
- `dist/` - Compiled JavaScript output
- `types/` - Generated TypeScript declaration files
- `tests/` - Test files (mirrors src/ structure)

### Key Architectural Patterns
- **Resource-based Organization**: Each Zendesk API resource (tickets, users, etc.) has its own class
- **HTTP Client Abstraction**: Base HTTP client handles authentication, rate limiting, and error handling
- **Type Safety**: Full TypeScript interfaces for all Zendesk API models and responses
- **Authentication**: Support for API tokens and OAuth 2.0 flows
- **Error Handling**: Custom error classes for different API error types
- **Rate Limiting**: Built-in handling of Zendesk's rate limits

### Authentication Flow
The client supports multiple authentication methods:
- API Token authentication (subdomain + email + token)
- OAuth 2.0 (client credentials and authorization code flows)
- JWT tokens for Zendesk apps

### Resource Classes
Each major Zendesk resource should have its own class:
- `Tickets` - Ticket CRUD operations, comments, attachments
- `Users` - User management, profiles, identities
- `Organizations` - Organization management
- `Groups` - Agent group management
- `Brands` - Multi-brand support operations
- `Macros` - Macro management
- `Views` - Custom view operations

### Testing Strategy
- Unit tests for all resource classes using mocked HTTP responses
- Integration tests with Zendesk sandbox environment
- Type-level tests to ensure API response types match Zendesk documentation
- Mock the HTTP client to test different response scenarios and error conditions

### API Response Handling
- All API responses are typed according to Zendesk's API documentation
- Pagination is handled automatically with async iterators
- Error responses are mapped to specific error classes
- Rate limit headers are parsed and exposed for client-side handling

## API Documentation Link Rule

**MUST** 📖 Each API method in resource classes MUST include a comment with the official Zendesk API documentation link

- Format: `// https://developer.zendesk.com/api-reference/...`
- Place the comment immediately before the method implementation
- Use the exact URL from the official Zendesk API Reference at https://developer.zendesk.com/api-reference/
- This is a fundamental requirement for maintaining API documentation consistency

Example:
```typescript
// チケット一覧取得
// https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#list-tickets
async list(options: PaginationOptions = {}): Promise<TicketsResponse> {
  // implementation
}
```

## API Implementation Verification Rule

**MUST** 🔍 When updating or implementing any API request processing, ALWAYS reference and verify against the official documentation

### Mandatory Verification Steps:
1. **Before making changes**: Check the official Zendesk API documentation at the provided link
2. **Verify request format**: Ensure HTTP method, endpoint path, and parameters match the official specification
3. **Verify response format**: Confirm response types and structure align with documented API responses
4. **Check for updates**: Verify if there are any API changes or deprecations in the official documentation
5. **Test against specification**: Validate implementation behavior matches documented API behavior

### Process:
```
1. Open the API documentation link in the method comment
2. Review the official specification for:
   - HTTP method (GET, POST, PUT, DELETE)
   - Endpoint URL structure
   - Required/optional parameters
   - Request body format
   - Response structure
   - Error handling
3. Update implementation to match official specification
4. Update TypeScript types if API specification has changed
```

**This verification against official documentation is mandatory for all API-related code changes.**
