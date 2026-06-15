# チャンネルページ キャッシング修正後のフロー

```mermaid
graph TD
    A["🎬 ユーザーがチャンネルページを開く"] --> B["📡 2つのリクエスト送信"]
    
    B --> B1["video.getChannel<br/>channelId: UC_xxx"]
    B --> B2["video.getVideos<br/>channelId: UC_xxx"]
    
    B1 --> C1{"Redis SWR<br/>channel:UC_xxx<br/>をチェック"}
    B2 --> C2{"Redis SWR<br/>channelVideos:UC_xxx:30:initial<br/>をチェック"}
    
    C1 -->|MISS| D1["🌐 YouTube API 呼び出し<br/>channels.list"]
    C2 -->|MISS| D2["🌐 YouTube API 呼び出し<br/>search (channelId filter)"]
    
    D1 --> E1["💾 Redis に保存<br/>TTL: 1時間"]
    D2 --> E2["💾 Redis に保存<br/>TTL: 30分"]
    
    E1 --> F["✅ チャンネル情報表示"]
    E2 --> F
    
    F --> G["⏱️ ユーザーが戻る"]
    
    G --> H["🔄 ページ再ロード"]
    
    H --> I["🎬 ユーザーがチャンネルページを再度開く"]
    
    I --> J["📡 2つのリクエスト送信"]
    
    J --> J1["video.getChannel"]
    J --> J2["video.getVideos"]
    
    J1 --> K1{"Redis SWR<br/>channel:UC_xxx<br/>をチェック"}
    J2 --> K2{"Redis SWR<br/>channelVideos:UC_xxx:30:initial<br/>をチェック"}
    
    K1 -->|HIT| L1["✅ Redis から即座に返す<br/>レスポンス時間: ~1ms"]
    K2 -->|HIT| L2["✅ Redis から即座に返す<br/>レスポンス時間: ~1ms"]
    
    L1 --> M["🎉 チャンネル情報表示<br/>API 呼び出しなし！"]
    L2 --> M
    
    style A fill:#e1f5ff
    style M fill:#c8e6c9
    style D1 fill:#ffccbc
    style D2 fill:#ffccbc
    style L1 fill:#fff9c4
    style L2 fill:#fff9c4
```

## 修正前後の比較

### 修正前（問題あり）
```
1回目のチャンネル読み込み:
  ✅ video.getChannel → API 呼び出し
  ✅ video.getVideos → API 呼び出し
  合計: 2回の API 呼び出し

戻る → 再ロード

2回目のチャンネル読み込み:
  ✅ video.getChannel → キャッシュ HIT（API なし）
  ❌ video.getVideos → キャッシュなし（API 呼び出し）← 問題！
  合計: 1回の API 呼び出し（無駄）
```

### 修正後（最適化）
```
1回目のチャンネル読み込み:
  ✅ video.getChannel → API 呼び出し
  ✅ video.getVideos → API 呼び出し
  合計: 2回の API 呼び出し

戻る → 再ロード

2回目のチャンネル読み込み:
  ✅ video.getChannel → キャッシュ HIT（API なし）
  ✅ video.getVideos → キャッシュ HIT（API なし）← 修正！
  合計: 0回の API 呼び出し（完全最適化）
```

## キャッシング設定

| エンドポイント | キャッシュキー | TTL | staleTime |
|---------------|--------------|-----|-----------|
| `video.getChannel` | `channel:{channelId}` | 1時間 | 30分 |
| `video.getVideos` | `channelVideos:{channelId}:{maxResults}:{pageToken}` | 30分 | 15分 |

## 効果

- **API 呼び出し削減**: 同じチャンネルへの再アクセスで 100% 削減
- **レスポンス時間**: ~1ms（従来は 500-2000ms）
- **ユーザー体験**: ページ遷移が高速化
- **API クォータ節約**: 毎日のアクセスで大幅に削減
