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
  token: 'your-api-token'
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

## ライセンス

MIT