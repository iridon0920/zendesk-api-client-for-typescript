# Zendesk API Client for TypeScript

![npm](https://img.shields.io/npm/v/zendesk-api-client-typescript)
![license](https://img.shields.io/npm/l/zendesk-api-client-typescript)
![node](https://img.shields.io/node/v/zendesk-api-client-typescript)

TypeScript用のZendesk API クライアントライブラリです。型安全で使いやすいインターフェースを提供し、自動的なRate Limit管理機能を搭載しています。


## インストール

```bash
npm install zendesk-api-client-typescript
```

## 🚀 クイックスタート

```typescript
import { ZendeskClient } from 'zendesk-api-client-typescript';

const client = new ZendeskClient({
  subdomain: 'your-subdomain',
  email: 'your-email@example.com',
  token: 'your-api-token'
});

// チケット一覧を取得
const tickets = await client.tickets.list();

// ユーザーを作成
const user = await client.users.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

## 使用方法

### 基本的な設定

```typescript
import { ZendeskClient } from 'zendesk-api-client-typescript';

const client = new ZendeskClient({
  subdomain: 'your-subdomain',
  email: 'your-email@example.com',
  token: 'your-api-token',
  // Rate limit対応のオプション設定
  httpOptions: {
    maxRetries: 3,        // 429エラー時の最大リトライ回数
    retryDelay: 1000,     // リトライ間隔（ミリ秒）
    rateLimitBuffer: 10   // 残りリクエスト数がこの値以下で自動待機
  }
});
```

### チケット操作

```typescript
// チケット一覧取得
const tickets = await client.tickets.list({
  per_page: 50,
  sort_by: 'created_at',
  sort_order: 'desc'
});

// チケット詳細取得
const ticket = await client.tickets.show(12345);

// チケット作成
const newTicket = await client.tickets.create({
  subject: 'サポートが必要です',
  comment: {
    body: 'この問題について助けが必要です。',
    public: true
  },
  type: 'question',
  priority: 'normal'
});

// チケット更新
const updatedTicket = await client.tickets.update(12345, {
  status: 'solved',
  comment: {
    body: '問題が解決しました。',
    public: true
  }
});
```

## 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト実行
npm test

# リント
npm run lint

# フォーマット
npm run format
```

## Rate Limit管理

クライアントは自動的にZendeskのRate Limitに対応します：

```typescript
// Rate limit情報の取得
const rateLimitInfo = client.getRateLimitInfo();
if (rateLimitInfo) {
  console.log(`残りリクエスト数: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
  console.log(`リセット時刻: ${rateLimitInfo.resetTime}`);
}

// 手動でRate limitを回避したい場合
await client.users.list();
const info = client.getRateLimitInfo();
if (info && info.remaining < 5) {
  console.log('Rate limit近づいています。少し待機...');
  await new Promise(resolve => setTimeout(resolve, 60000));
}
```

### Rate Limit機能

- ✅ **自動リトライ**: 429エラー時の指数バックオフリトライ
- ✅ **プロアクティブ待機**: 残りリクエスト数が少なくなったら自動待機
- ✅ **ヘッダー監視**: Zendeskのrate limitヘッダーを自動解析
- ✅ **柔軟な設定**: リトライ回数、遅延時間、バッファサイズを調整可能

## 📖 API ドキュメント

### ZendeskClient

```typescript
const client = new ZendeskClient(config: ZendeskClientConfig)
```

#### ZendeskClientConfig

| プロパティ | 型 | 必須 | 説明 |
|------------|----|----|-----|
| `subdomain` | string | ✅ | Zendeskサブドメイン |
| `email` | string | ✅ | Zendeskアカウントのメールアドレス |
| `token` | string | ✅ | API トークン |
| `apiVersion` | string | ❌ | APIバージョン (デフォルト: 'v2') |
| `httpOptions` | HttpClientOptions | ❌ | HTTP設定オプション |

#### HttpClientOptions

| プロパティ | 型 | デフォルト | 説明 |
|------------|----|-----------|----|
| `maxRetries` | number | 3 | 最大リトライ回数 |
| `retryDelay` | number | 1000 | ベースリトライ間隔（ミリ秒） |
| `rateLimitBuffer` | number | 10 | プロアクティブ待機のしきい値 |

### 対応API

- **Users API**: ユーザーの作成、取得、更新、削除、検索
- **Organizations API**: 組織の作成、取得、更新、削除、検索
- **Tickets API**: チケットの作成、取得、更新、削除、検索

詳細なAPIリファレンスは[Zendesk公式ドキュメント](https://developer.zendesk.com/api-reference/)を参照してください。

## 📚 使用例

### ユーザー管理

```typescript
// ユーザーの作成
const newUser = await client.users.create({
  name: '田中太郎',
  email: 'tanaka@example.com',
  role: 'end-user',
  verified: true,
  tags: ['vip', 'japanese']
});

// ユーザーの検索
const users = await client.users.search('tanaka@example.com');

// ユーザーの更新
const updatedUser = await client.users.update(userId, {
  name: '田中次郎',
  phone: '+81-90-1234-5678'
});
```

### 組織管理

```typescript
// 組織の作成
const organization = await client.organizations.create({
  name: '株式会社サンプル',
  domain_names: ['sample.co.jp'],
  details: '東京都に本社を置くIT企業'
});

// 組織メンバーの管理
const memberships = await client.organizations.listMemberships(organizationId);
```

### チケット管理

```typescript
// チケットの作成
const ticket = await client.tickets.create({
  subject: 'ログインできません',
  comment: {
    body: 'パスワードを忘れてしまい、ログインできない状況です。',
    public: true
  },
  type: 'incident',
  priority: 'high',
  tags: ['login', 'password']
});

// チケットの更新
const updatedTicket = await client.tickets.update(ticketId, {
  status: 'open',
  assignee_id: agentId,
  comment: {
    body: '調査を開始いたします。',
    public: true
  }
});

// チケットの検索
const urgentTickets = await client.tickets.search(
  'type:incident priority:high status<solved'
);
```

### エラーハンドリング

```typescript
import {
  ZendeskError,
  ZendeskRateLimitError,
  ZendeskAuthenticationError
} from 'zendesk-api-client-typescript';

try {
  const user = await client.users.create(userData);
} catch (error) {
  if (error instanceof ZendeskRateLimitError) {
    console.log(`Rate limit発生。${error.retryAfter}秒後に再試行してください`);
  } else if (error instanceof ZendeskAuthenticationError) {
    console.log('認証エラー: APIトークンを確認してください');
  } else if (error instanceof ZendeskError) {
    console.log(`Zendesk API エラー: ${error.message}`);
  }
}
```

## ライセンス

MIT
