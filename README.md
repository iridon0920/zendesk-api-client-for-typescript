# Zendesk API Client for TypeScript

TypeScript用のZendesk API クライアントライブラリです。型安全で使いやすいインターフェースを提供します。

## インストール

```bash
npm install zendesk-api-client-typescript
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

## ライセンス

MIT