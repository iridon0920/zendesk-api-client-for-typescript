// HTTPクライアント基盤クラス

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { AuthHandler } from '../auth/ApiTokenAuth';
import {
  ZendeskError,
  ZendeskAuthenticationError,
  ZendeskRateLimitError,
} from '../errors/ZendeskError';
import { ErrorResponse } from '../types/common';

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly auth: AuthHandler;

  constructor(auth: AuthHandler) {
    this.auth = auth;
    this.axiosInstance = axios.create({
      baseURL: auth.getBaseUrl(),
      headers: auth.getAuthHeaders(),
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // レスポンスインターセプター（エラーハンドリング）
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
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
    const response = await this.axiosInstance.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url);
    return response.data;
  }
}
