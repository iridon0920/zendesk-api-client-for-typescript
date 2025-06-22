// ZendeskClientの基本テスト

import { ZendeskClient } from '../src/index';
import { ZendeskConfig } from '../src/types/common';

describe('ZendeskClient', () => {
  const mockConfig: ZendeskConfig = {
    subdomain: 'test',
    email: 'test@example.com',
    token: 'test-token',
  };

  let client: ZendeskClient;

  beforeEach(() => {
    client = new ZendeskClient(mockConfig);
  });

  it('should create a ZendeskClient instance', () => {
    expect(client).toBeInstanceOf(ZendeskClient);
  });

  it('should have tickets resource', () => {
    expect(client.tickets).toBeDefined();
  });

  it('should initialize with correct configuration', () => {
    // クライアントが正しく初期化されることを確認
    expect(client).toHaveProperty('tickets');
  });
});