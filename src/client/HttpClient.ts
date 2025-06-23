// HTTPクライアント基盤クラス

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { AuthHandler } from '../auth/ApiTokenAuth';
import {
  ZendeskError,
  ZendeskAuthenticationError,
  ZendeskRateLimitError,
} from '../errors/ZendeskError';
import { ErrorResponse } from '../types/common';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

export interface HttpClientOptions {
  maxRetries?: number;
  retryDelay?: number;
  rateLimitBuffer?: number; // 残りリクエスト数がこの値以下になったら自動的に待機
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly auth: AuthHandler;
  private readonly options: HttpClientOptions;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(auth: AuthHandler, options: HttpClientOptions = {}) {
    this.auth = auth;
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      rateLimitBuffer: 10,
      ...options
    };
    
    this.axiosInstance = axios.create({
      baseURL: auth.getBaseUrl(),
      headers: auth.getAuthHeaders(),
    });

    this.setupInterceptors();
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;
    const limit = headers['x-rate-limit'] || headers['x-rate-limit-limit'];
    const remaining = headers['x-rate-limit-remaining'];
    const reset = headers['x-rate-limit-reset'];

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetTime: new Date(parseInt(reset, 10) * 1000)
      };
    }
  }

  private async checkRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) return;

    // バッファ以下になったら、リセット時間まで待機
    if (this.rateLimitInfo.remaining <= this.options.rateLimitBuffer!) {
      const now = new Date();
      const waitTime = Math.max(0, this.rateLimitInfo.resetTime.getTime() - now.getTime());
      
      if (waitTime > 0) {
        console.log(`Rate limit buffer reached. Waiting ${waitTime}ms until reset...`);
        await this.sleep(waitTime);
      }
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    retryCount = 0
  ): Promise<T> {
    try {
      await this.checkRateLimit();
      const response = await operation();
      this.updateRateLimitInfo(response);
      return response.data;
    } catch (error) {
      if (error instanceof ZendeskRateLimitError && retryCount < this.options.maxRetries!) {
        const waitTime = error.retryAfter ? error.retryAfter * 1000 : 
                        Math.pow(2, retryCount) * this.options.retryDelay!;
        
        console.log(`Rate limited. Retrying after ${waitTime}ms (attempt ${retryCount + 1}/${this.options.maxRetries})`);
        await this.sleep(waitTime);
        return this.executeWithRetry(operation, retryCount + 1);
      }
      throw error;
    }
  }

  private setupInterceptors(): void {
    // レスポンスインターセプター（エラーハンドリング）
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.updateRateLimitInfo(response);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          const { status, statusText, data } = error.response;

          // 認証エラー
          if (status === 401) {
            throw new ZendeskAuthenticationError('認証に失敗しました');
          }

          // レート制限エラー
          if (status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            throw new ZendeskRateLimitError(
              'レート制限に達しました',
              retryAfter ? parseInt(retryAfter, 10) : undefined
            );
          }

          // その他のAPIエラー
          if (data && typeof data === 'object' && 'error' in data) {
            throw ZendeskError.fromResponse(
              status,
              statusText,
              data as ErrorResponse
            );
          }
        }

        // ネットワークエラーなど
        throw new ZendeskError(
          error.message || '不明なエラーが発生しました',
          0,
          'Network Error'
        );
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.executeWithRetry(() => this.axiosInstance.get<T>(url, { params }));
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.executeWithRetry(() => this.axiosInstance.post<T>(url, data));
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.executeWithRetry(() => this.axiosInstance.put<T>(url, data));
  }

  async delete<T>(url: string): Promise<T> {
    return this.executeWithRetry(() => this.axiosInstance.delete<T>(url));
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }
}
