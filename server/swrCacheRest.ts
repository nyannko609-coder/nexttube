import axios from "axios";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
}

type CachePayload = {
  data: any;
  updatedAt: number;
};

// Upstash REST APIクライアント
const upstashClient = axios.create({
  baseURL: UPSTASH_URL,
  headers: {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
  },
});

/**
 * Upstash REST APIを使用したSWR (Stale While Revalidate) キャッシング機構
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
  const ttl = options?.ttl ?? 600;
  const staleTime = options?.staleTime ?? 300;

  try {
    // キャッシュから取得
    const cached = await getCacheFromUpstash(key);

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

      console.log(`[SWR] Cache hit for ${key}, age: ${Math.round(age / 1000)}s`);
      return parsed.data;
    }

    // キャッシュなし → API呼び出し
    console.log(`[SWR] Cache miss for ${key}, fetching...`);
    const fresh = await fetcher();

    // キャッシュに保存
    await setCacheToUpstash(
      key,
      JSON.stringify({
        data: fresh,
        updatedAt: Date.now(),
      }),
      ttl
    );

    console.log(`[SWR] Cached ${key} for ${ttl}s`);
    return fresh;
  } catch (err) {
    console.error(`[SWR] Error for ${key}:`, err);
    // エラー時は、キャッシュがあれば返す
    try {
      const cached = await getCacheFromUpstash(key);
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
 * Upstashからキャッシュを取得
 * Upstash REST APIの形式: GET /get/<key>
 */
async function getCacheFromUpstash(key: string): Promise<string | null> {
  try {
    const response = await upstashClient.get(`/get/${key}`);
    return response.data.result || null;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Upstashにキャッシュを保存
 * Upstash REST APIの形式: POST /set/<key> with body: [value, "EX", ttl]
 */
async function setCacheToUpstash(key: string, value: string, ttl: number): Promise<void> {
  try {
    await upstashClient.post(`/set/${key}`, [value, "EX", ttl]);
  } catch (err) {
    console.error(`[SWR] Failed to set cache for ${key}:`, err);
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

    await setCacheToUpstash(
      key,
      JSON.stringify({
        data: fresh,
        updatedAt: Date.now(),
      }),
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
  try {
    await upstashClient.post(`/del/${key}`);
    console.log(`[SWR] Invalidated cache for ${key}`);
  } catch (err) {
    console.error(`[SWR] Failed to invalidate cache for ${key}:`, err);
  }
}

/**
 * キャッシュをクリア（パターンマッチ）
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // Upstash REST APIではパターンマッチが直接サポートされていないため、
    // 個別削除が必要な場合は別途実装が必要
    console.log(`[SWR] Pattern invalidation not supported in REST API: ${pattern}`);
  } catch (err) {
    console.error(`[SWR] Failed to invalidate pattern ${pattern}:`, err);
  }
}
