// メインのZendeskクライアントクラス

import { ZendeskConfig } from '../types/common';
import { ApiTokenAuth } from '../auth/ApiTokenAuth';
import { HttpClient } from './HttpClient';
import { Tickets } from '../resources/Tickets';
import { Users } from '../resources/Users';
import { Organizations } from '../resources/Organizations';

export class ZendeskClient {
  private readonly httpClient: HttpClient;
  public readonly tickets: Tickets;
  public readonly users: Users;
  public readonly organizations: Organizations;

  constructor(config: ZendeskConfig) {
    const auth = new ApiTokenAuth(config);
    this.httpClient = new HttpClient(auth);

    // リソースクラスの初期化
    this.tickets = new Tickets(this.httpClient);
    this.users = new Users(this.httpClient);
    this.organizations = new Organizations(this.httpClient);
  }
}
