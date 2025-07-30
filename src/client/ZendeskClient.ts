// メインのZendeskクライアントクラス

import { ZendeskConfig } from '../types/common';
import { ApiTokenAuth } from '../auth/ApiTokenAuth';
import { HttpClient, HttpClientOptions } from './HttpClient';
import { Tickets } from '../resources/Tickets';
import { Users } from '../resources/Users';
import { Organizations } from '../resources/Organizations';
import { Search } from '../resources/Search';
import { Triggers } from '../resources/triggers';
import { TriggerCategories } from '../resources/triggerCategories';
import { Views } from '../resources/views';
import { Macros } from '../resources/macros';
import { Automations } from '../resources/automations';

export interface ZendeskClientConfig extends ZendeskConfig {
  httpOptions?: HttpClientOptions;
}

export class ZendeskClient {
  private readonly httpClient: HttpClient;
  public readonly tickets: Tickets;
  public readonly users: Users;
  public readonly organizations: Organizations;
  public readonly search: Search;
  public readonly triggers: Triggers;
  public readonly triggerCategories: TriggerCategories;
  public readonly views: Views;
  public readonly macros: Macros;
  public readonly automations: Automations;

  constructor(config: ZendeskClientConfig) {
    const auth = new ApiTokenAuth(config);
    this.httpClient = new HttpClient(auth, config.httpOptions);

    // リソースクラスの初期化
    this.tickets = new Tickets(this.httpClient);
    this.users = new Users(this.httpClient);
    this.organizations = new Organizations(this.httpClient);
    this.search = new Search(this.httpClient);
    this.triggers = new Triggers(this.httpClient);
    this.triggerCategories = new TriggerCategories(this.httpClient);
    this.views = new Views(this.httpClient);
    this.macros = new Macros(this.httpClient);
    this.automations = new Automations(this.httpClient);
  }

  getRateLimitInfo() {
    return this.httpClient.getRateLimitInfo();
  }
}
