# 2層キャッシング機構のフロー

```mermaid
graph TD
    A["🎬 ユーザーが動画詳細をリクエスト<br/>getVideoDetails(videoId)"] --> B{"Redis SWR キャッシュ<br/>をチェック"}
    
    B -->|キャッシュ HIT<br/>age < staleTime| C["✅ Redis から即座に返す<br/>レスポンス時間: ~1ms"]
    C --> D["🎉 高速応答完了"]
    
    B -->|キャッシュ HIT<br/>age > staleTime| E["⚠️ Stale データを返す<br/>同時にバックグラウンド更新開始"]
    E --> F["🔄 バックグラウンドで<br/>DB キャッシュをチェック"]
    
    B -->|キャッシュ MISS| G{"MySQL video_cache<br/>をチェック"}
    
    F --> G
    
    G -->|キャッシュ HIT<br/>cacheExpiredAt > now| H["✅ DB から返す<br/>レスポンス時間: ~10-50ms"]
    H --> I["🎉 応答完了<br/>同時に Redis に保存"]
    I --> J["💾 Redis TTL: 10分"]
    
    G -->|キャッシュ MISS<br/>or 有効期限切れ| K["🌐 YouTube API を呼び出し<br/>quotaCost: 1"]
    K --> L["⏳ API レスポンス待機<br/>レスポンス時間: ~500-2000ms"]
    L --> M["💾 結果を MySQL に保存<br/>cacheExpiredAt: 24時間後"]
    M --> N["💾 結果を Redis に保存<br/>TTL: 1時間"]
    N --> O["🎉 ユーザーに返す"]
    
    style A fill:#e1f5ff
    style D fill:#c8e6c9
    style I fill:#c8e6c9
    style O fill:#c8e6c9
    style C fill:#fff9c4
    style E fill:#fff9c4
    style H fill:#fff9c4
    style K fill:#ffccbc
    style L fill:#ffccbc
```

## キャッシング層の詳細

### 層1: Redis SWR キャッシュ（短期）
- **保存先**: Upstash Redis
- **TTL**: 10分～60分（データ種別による）
- **staleTime**: 5分（デフォルト）
- **更新戦略**: Stale While Revalidate
  - staleTime 経過後は古いデータを返しつつバックグラウンド更新
  - ユーザーには常に高速応答

### 層2: MySQL video_cache（長期）
- **保存先**: Manus MySQL Database
- **TTL**: 24時間
- **更新戦略**: 有効期限切れまで保持
  - 同じデータへの複数アクセスで API 呼び出しを削減
  - 24時間ごとに最新データに更新

## レスポンス時間の比較

| シナリオ | キャッシュ層 | レスポンス時間 | API 呼び出し |
|---------|-----------|-------------|-----------|
| **Redis HIT** | Layer 1 | ~1ms | ❌ なし |
| **Redis Stale** | Layer 2 | ~10-50ms | ✅ バックグラウンド |
| **DB HIT** | Layer 2 | ~10-50ms | ❌ なし |
| **キャッシュ MISS** | YouTube API | ~500-2000ms | ✅ あり |

## 実装コード例

### Redis SWR キャッシュ
```typescript
// server/swrCache.ts
export async function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; staleTime?: number }
): Promise<T> {
  const cached = await redis.get(key);
  
  if (cached) {
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.updatedAt;
    
    // staleTime 経過後はバックグラウンド更新
    if (age > staleTime * 1000) {
      revalidate(key, fetcher, ttl).catch(console.error);
    }
    
    return parsed.data; // 即座に返す
  }
  
  // キャッシュなし → API 呼び出し
  const fresh = await fetcher();
  await redis.set(key, JSON.stringify({ data: fresh, updatedAt: Date.now() }), "EX", ttl);
  return fresh;
}
```

### MySQL video_cache
```typescript
// server/youtubeApi.ts
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  // Layer 2: DB キャッシュをチェック
  const cached = await getCachedVideo(videoId);
  if (cached && cached.cacheExpiredAt > new Date()) {
    return cached; // DB から返す
  }
  
  // キャッシュなし → YouTube API を呼び出し
  const video = await fetchFromYouTubeAPI(videoId);
  
  // Layer 2: DB に保存（24時間）
  await cacheVideo({
    videoId,
    ...video,
    cacheExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  return video;
}
```

## 現在のキャッシュ状態

### Redis に保存されているデータ
- **search**: 検索結果（30分 TTL）
- **comments**: コメント（10分 TTL）
- **details**: 動画詳細（60分 TTL）
- **related**: 関連動画（30分 TTL）

### MySQL に保存されているデータ
- **video_cache**: 動画メタデータ（24時間 TTL）
  - videoId, title, description, viewCount, likeCount, commentCount など
