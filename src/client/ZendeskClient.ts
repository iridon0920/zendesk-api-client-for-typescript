// メインのZendeskクライアントクラス

import { ZendeskConfig } from '../types/common';
import { ApiTokenAuth } from '../auth/ApiTokenAuth';
import { HttpClient, HttpClientOptions } from './HttpClient';
import { Tickets } from '../resources/Tickets';
import { Users } from '../resources/Users';
import { Organizations } from '../resources/Organizations';
import { Search } from '../resources/Search';

export interface ZendeskClientConfig extends ZendeskConfig {
  httpOptions?: HttpClientOptions;
}

export class ZendeskClient {
  private readonly httpClient: HttpClient;
  public readonly tickets: Tickets;
  public readonly users: Users;
  public readonly organizations: Organizations;
  public readonly search: Search;

  constructor(config: ZendeskClientConfig) {
    const auth = new ApiTokenAuth(config);
    this.httpClient = new HttpClient(auth, config.httpOptions);

    // リソースクラスの初期化
    this.tickets = new Tickets(this.httpClient);
    this.users = new Users(this.httpClient);
    this.organizations = new Organizations(this.httpClient);
    this.search = new Search(this.httpClient);
  }

  getRateLimitInfo() {
    return this.httpClient.getRateLimitInfo();
  }
}
