// ApiTokenAuth のテスト

import { ApiTokenAuth } from '../../src/auth/ApiTokenAuth';
import { ZendeskConfig } from '../../src/types/common';

describe('ApiTokenAuth', () => {
  const mockConfig: ZendeskConfig = {
    subdomain: 'mycompany',
    email: 'agent@mycompany.com',
    token: 'my-api-token',
  };

  let auth: ApiTokenAuth;

  beforeEach(() => {
    auth = new ApiTokenAuth(mockConfig);
  });

  it('should generate correct base URL', () => {
    const baseUrl = auth.getBaseUrl();
    expect(baseUrl).toBe('https://mycompany.zendesk.com/api/v2');
  });

  it('should generate correct auth headers', () => {
    const headers = auth.getAuthHeaders();
    expect(headers).toHaveProperty('Authorization');
    expect(headers).toHaveProperty('Content-Type', 'application/json');
    
    // Basic認証のBase64エンコードを確認
    const expectedCredentials = Buffer.from(
      `${mockConfig.email}/token:${mockConfig.token}`
    ).toString('base64');
    expect(headers.Authorization).toBe(`Basic ${expectedCredentials}`);
  });

  it('should use custom API version when provided', () => {
    const customConfig: ZendeskConfig = {
      ...mockConfig,
      apiVersion: 'v3',
    };
    const customAuth = new ApiTokenAuth(customConfig);
    const baseUrl = customAuth.getBaseUrl();
    expect(baseUrl).toBe('https://mycompany.zendesk.com/api/v3');
  });
});