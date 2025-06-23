# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-23

### Added
- Initial release of Zendesk API Client for TypeScript
- **Core Features**:
  - Type-safe Zendesk API client
  - Full TypeScript support with comprehensive type definitions
  - Support for Users, Organizations, and Tickets APIs
  
- **Rate Limiting**:
  - Automatic rate limit detection and handling
  - Proactive waiting when approaching rate limits
  - Exponential backoff retry mechanism for 429 errors
  - Configurable retry settings and rate limit buffer
  
- **HTTP Client**:
  - Axios-based HTTP client with interceptors
  - Custom error handling for different HTTP status codes
  - Automatic authentication header injection
  - Request/response logging capabilities

- **API Resources**:
  - **Users API**: Create, read, update, delete, search users
  - **Organizations API**: Create, read, update, delete, search organizations
  - **Tickets API**: Create, read, update, delete, search tickets
  
- **Error Handling**:
  - Custom error classes for different types of API errors
  - Rate limit specific error handling
  - Authentication error detection
  - Network error handling

- **Testing**:
  - Comprehensive unit test coverage
  - Integration tests with real Zendesk API
  - Automatic test data cleanup
  - Rate limit aware testing with delays

- **Documentation**:
  - Complete API documentation
  - Integration testing guide
  - Rate limiting best practices
  - Usage examples and quick start guide

### Technical Details
- Built with TypeScript 5.8+
- Requires Node.js 16+
- Uses Axios for HTTP requests
- Jest for testing framework
- ESLint and Prettier for code quality

### Dependencies
- `axios`: ^1.4.0

### Dev Dependencies
- TypeScript, Jest, ESLint, Prettier
- Various @types packages for TypeScript support