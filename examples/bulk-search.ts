// Search APIを使った大量データ取得の使用例

import { ZendeskClient } from '../src/client/ZendeskClient';
import { SearchOptions, BulkSearchOptions } from '../src/types/search';

// 初期化
const client = new ZendeskClient({
  subdomain: 'your-subdomain',
  email: 'your-email@example.com',
  token: 'your-api-token'
});

// 基本的な検索
async function basicSearch() {
  console.log('=== 基本的な検索 ===');
  
  // チケット検索
  const tickets = await client.search.searchTickets({
    query: 'status:open priority:high',
    per_page: 50
  });
  console.log(`見つかったチケット数: ${tickets.count}`);
  console.log('最初のチケット:', tickets.results[0]?.subject);

  // ユーザー検索
  const users = await client.search.searchUsers({
    query: 'role:agent active:true',
    per_page: 25
  });
  console.log(`見つかったユーザー数: ${users.count}`);
  
  // 組織検索
  const orgs = await client.search.searchOrganizations({
    query: 'created>2024-01-01',
    per_page: 30
  });
  console.log(`見つかった組織数: ${orgs.count}`);
}

// 大量データの全件取得（Async Iterator使用）
async function bulkDataRetrieval() {
  console.log('=== 大量データ取得 ===');
  
  // 進捗コールバックの設定
  client.search.setProgressCallback((progress) => {
    console.log(`進捗: ${progress.current_page}/${progress.total_pages}ページ, ` +
               `処理済み: ${progress.processed_results}件, ` +
               `経過時間: ${Math.round(progress.elapsed_time / 1000)}秒`);
  });

  // 全チケットを取得（ページネーション自動化）
  let totalTickets = 0;
  for await (const ticketBatch of client.search.searchAllTickets({
    query: 'created>2024-01-01',
    per_page: 100
  })) {
    totalTickets += ticketBatch.length;
    console.log(`バッチ取得: ${ticketBatch.length}件のチケット`);
    
    // 各バッチで何らかの処理を実行
    for (const ticket of ticketBatch) {
      // 例: チケットデータの処理
      console.log(`処理中: チケット#${ticket.id} - ${ticket.subject}`);
    }
  }
  console.log(`総チケット数: ${totalTickets}`);
}

// 日付範囲での分割検索（超大量データ対応）
async function dateRangeSearch() {
  console.log('=== 日付範囲分割検索 ===');
  
  const options: BulkSearchOptions = {
    query: 'status:closed', // 解決済みチケット
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    chunk_size: 7, // 1週間ずつ分割
    max_results: 10000, // 最大10,000件まで
    per_page: 100
  };

  let processedCount = 0;
  for await (const ticketBatch of client.search.searchByDateRange(
    (opts) => client.search.searchTickets(opts),
    options
  )) {
    processedCount += ticketBatch.length;
    console.log(`日付範囲バッチ: ${ticketBatch.length}件 (累計: ${processedCount}件)`);
    
    // バッチ処理の例
    const ticketIds = ticketBatch.map(t => t.id);
    console.log(`処理対象IDs: [${ticketIds.slice(0, 5).join(', ')}...]`);
  }
}

// エクスポート検索（カーソルベース）
async function exportSearch() {
  console.log('=== エクスポート検索 ===');
  
  // 大量データに最適化されたエクスポート検索
  const exportResult = await client.search.exportSearch<any>(
    'type:ticket created>2024-01-01'
  );
  
  console.log(`エクスポート結果: ${exportResult.results.length}件`);
  console.log(`ストリーム終了: ${exportResult.end_of_stream}`);
  
  if (exportResult.next_page) {
    console.log('次のページが利用可能');
  }
}

// 複合検索とフィルタリング
async function advancedSearch() {
  console.log('=== 高度な検索 ===');
  
  // 複雑な検索クエリ
  const searchOptions: SearchOptions = {
    query: 'type:ticket status:open priority:high assignee:agent@company.com created>=2024-01-01',
    sort_by: 'updated_at',
    sort_order: 'desc',
    per_page: 50,
    include: ['users', 'organizations'] // サイドローディング
  };

  const results = await client.search.search(searchOptions);
  console.log(`高度な検索結果: ${results.count}件`);
  
  // ファセット情報の表示（検索結果の統計）
  if (results.facets) {
    console.log('検索ファセット:', JSON.stringify(results.facets, null, 2));
  }
}

// リアルタイム監視（定期的な検索）
async function monitorTickets() {
  console.log('=== リアルタイム監視 ===');
  
  const monitorQuery = 'type:ticket status:new created>now-1h';
  
  // 5分おきに新しいチケットをチェック
  setInterval(async () => {
    try {
      const newTickets = await client.search.searchTickets({
        query: monitorQuery,
        per_page: 10
      });
      
      if (newTickets.results.length > 0) {
        console.log(`新しいチケット: ${newTickets.results.length}件`);
        for (const ticket of newTickets.results) {
          console.log(`- #${ticket.id}: ${ticket.subject}`);
        }
      }
    } catch (error) {
      console.error('監視エラー:', error);
    }
  }, 5 * 60 * 1000); // 5分間隔
}

// エラーハンドリングの例
async function errorHandlingExample() {
  console.log('=== エラーハンドリング ===');
  
  try {
    // 無効なクエリのテスト
    await client.search.searchTickets({
      query: 'invalid:query:syntax',
      per_page: 100
    });
  } catch (error) {
    if (error.name === 'SearchError') {
      console.log(`検索エラー: ${error.message}`);
      console.log(`クエリ: ${error.query}`);
      console.log(`ページ: ${error.page}`);
    } else {
      console.error('その他のエラー:', error);
    }
  }
}

// レート制限対応の例
async function rateLimitHandling() {
  console.log('=== レート制限対応 ===');
  
  // レート制限情報の確認
  const rateLimitInfo = client.getRateLimitInfo();
  if (rateLimitInfo) {
    console.log(`残りリクエスト数: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
    console.log(`リセット時刻: ${rateLimitInfo.resetTime}`);
  }

  // 大量検索時の自動レート制限対応
  let count = 0;
  for await (const userBatch of client.search.searchAllUsers({
    query: 'active:true',
    per_page: 100
  })) {
    count += userBatch.length;
    console.log(`処理済みユーザー: ${count}人`);
    
    // 自動的にレート制限が適用される
    // HttpClientが自動的に待機・リトライを処理
  }
}

// メイン実行関数
async function main() {
  try {
    await basicSearch();
    await bulkDataRetrieval();
    await dateRangeSearch();
    await exportSearch();
    await advancedSearch();
    await errorHandlingExample();
    await rateLimitHandling();
    
    // 監視は最後に開始（無限ループのため）
    // await monitorTickets();
    
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

// 実行
if (require.main === module) {
  main();
}