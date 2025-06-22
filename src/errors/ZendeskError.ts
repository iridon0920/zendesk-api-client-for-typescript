// Zendesk API用のカスタムエラークラス

import { ErrorResponse } from '../types/common';

export class ZendeskError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    statusText: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ZendeskError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }

  static fromResponse(
    status: number,
    statusText: string,
    data: ErrorResponse
  ): ZendeskError {
    return new ZendeskError(
      data.error.message,
      status,
      statusText,
      data.error.details
    );
  }
}

export class ZendeskAuthenticationError extends ZendeskError {
  constructor(message: string) {
    super(message, 401, 'Unauthorized');
    this.name = 'ZendeskAuthenticationError';
  }
}

export class ZendeskRateLimitError extends ZendeskError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 429, 'Too Many Requests');
    this.name = 'ZendeskRateLimitError';
    this.retryAfter = retryAfter;
  }
}
