import { redis } from "./redis";
import { ENV } from "./_core/env";

type CachePayload = {
  data: any;
  updatedAt: number;
};

/**
 * SWR (Stale While Revalidate) キャッシング機構
 * - キャッシュが存在すればすぐに返す
 * - staleTime経過後は、古いデータを返しつつバックグラウンドで更新
 * - キャッシュなしの場合は、APIを呼び出して結果をキャッシュ
 */
export async function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number; // キャッシュの有効期限（秒）デフォルト: 600秒
    staleTime?: number; // staleと判定するまでの時間（秒）デフォルト: 300秒
  }
): Promise<T> {
  // SWR_ENABLED シークレットで制御（デフォルト: true）
  const swrEnabled = ENV.swrEnabled;
  
  const ttl = options?.ttl ?? 600;
  const staleTime = options?.staleTime ?? 300;

  try {
    // SWR が無効な場合は、常に API を呼び出す
    if (!swrEnabled) {
      console.log(`[SWR] SWR disabled, fetching fresh data for ${key}`);
      const fresh = await fetcher();
      return fresh;
    }

    const cached = await redis.get(key);

    if (cached) {
      const parsed: CachePayload = JSON.parse(cached);
      const age = Date.now() - parsed.updatedAt;

      // 🔥 staleでも即返す（ユーザーに高速応答）
      if (age > staleTime * 1000) {
        // バックグラウンドで更新（await しない）
        revalidate(key, fetcher, ttl).catch((err) => {
          console.error(`[SWR] Revalidate failed for ${key}:`, err);
        });
      }

      console.log(`[SWR] Cache hit for ${key}, age: ${Math.round(age / 1000)}s, staleTime: ${staleTime}s, ttl: ${ttl}s`);
      
      if (age > staleTime * 1000) {
        console.log(`[SWR] STALE: age ${Math.round(age / 1000)}s > staleTime ${staleTime}s - triggering background revalidation`);
      }
      
      return parsed.data;
    }

    // キャッシュなし → API呼び出し
    console.log(`[SWR] Cache miss for ${key}, fetching...`);
    const fresh = await fetcher();

    // キャッシュに保存
    await redis.set(
      key,
      JSON.stringify({
        data: fresh,
        updatedAt: Date.now(),
      }),
      "EX",
      ttl
    );

    console.log(`[SWR] Cached ${key} for ${ttl}s`);
    return fresh;
  } catch (err) {
    console.error(`[SWR] Error for ${key}:`, err);
    // エラー時は、キャッシュがあれば返す
    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed: CachePayload = JSON.parse(cached);
        console.log(`[SWR] Fallback to stale cache for ${key}`);
        return parsed.data;
      }
    } catch {
      // キャッシュ取得エラーは無視
    }
    // キャッシュもない場合はエラーを再スロー
    throw err;
  }
}

/**
 * バックグラウンドで古いデータを更新
 */
async function revalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
) {
  try {
    const fresh = await fetcher();

    await redis.set(
      key,
      JSON.stringify({
        data: fresh,
        updatedAt: Date.now(),
      }),
      "EX",
      ttl
    );

    console.log(`[SWR] Revalidated ${key}`);
  } catch (err) {
    console.error(`[SWR] Revalidate error for ${key}:`, err);
    // バックグラウンド更新のエラーは無視（古いデータを返し続ける）
  }
}

/**
 * キャッシュを手動削除
 */
export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
  console.log(`[SWR] Invalidated cache for ${key}`);
}

/**
 * キャッシュをクリア（パターンマッチ）
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`[SWR] Invalidated ${keys.length} cache entries matching ${pattern}`);
  }
}
