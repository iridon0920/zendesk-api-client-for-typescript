// API Token認証ハンドラー

import { ZendeskConfig } from '../types/common';

export interface AuthHandler {
  getAuthHeaders(): Record<string, string>;
  getBaseUrl(): string;
}

export class ApiTokenAuth implements AuthHandler {
  private readonly subdomain: string;
  private readonly email: string;
  private readonly token: string;
  private readonly apiVersion: string;

  constructor(config: ZendeskConfig) {
    this.subdomain = config.subdomain;
    this.email = config.email;
    this.token = config.token;
    this.apiVersion = config.apiVersion || 'v2';
  }

  getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(
      `${this.email}/token:${this.token}`
    ).toString('base64');
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  getBaseUrl(): string {
    return `https://${this.subdomain}.zendesk.com/api/${this.apiVersion}`;
  }
}
