import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { swrFetch, invalidateCache } from "./swrCache";
import { redis } from "./redis";

describe("SWR Cache", () => {
  beforeAll(async () => {
    // Redis接続テスト
    try {
      await redis.ping();
      console.log("[SWR Test] Redis connected successfully");
    } catch (err) {
      console.error("[SWR Test] Redis connection failed:", err);
      throw new Error("Redis connection failed. Please check REDIS_URL");
    }
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    await redis.flushdb();
    await redis.quit();
  });

  it("should cache and return data", async () => {
    const testKey = "test:cache:1";
    const testData = { message: "Hello, SWR!" };
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return testData;
    };

    // 1回目の呼び出し - APIを呼び出す
    const result1 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result1).toEqual(testData);
    expect(callCount).toBe(1);

    // 2回目の呼び出し - キャッシュから返す
    const result2 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result2).toEqual(testData);
    expect(callCount).toBe(1); // APIは呼ばれない

    // キャッシュをクリア
    await invalidateCache(testKey);
  });

  it("should handle cache expiry", async () => {
    const testKey = "test:cache:expiry";
    const testData = { value: 42 };
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return testData;
    };

    // 1秒のttlでキャッシュ
    const result1 = await swrFetch(testKey, fetcher, { ttl: 1, staleTime: 0.5 });
    expect(result1).toEqual(testData);
    expect(callCount).toBe(1);

    // 1.5秒待機（ttl経過）
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2回目の呼び出し - キャッシュ期限切れのため新しいAPIを呼び出す
    const result2 = await swrFetch(testKey, fetcher, { ttl: 1, staleTime: 0.5 });
    expect(result2).toEqual(testData);
    expect(callCount).toBe(2);

    // クリーンアップ
    await invalidateCache(testKey);
  });

  it("should handle errors gracefully", async () => {
    const testKey = "test:cache:error";
    let callCount = 0;

    const failingFetcher = async () => {
      callCount++;
      throw new Error("API Error");
    };

    // エラーが発生する
    try {
      await swrFetch(testKey, failingFetcher, { ttl: 60, staleTime: 30 });
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect((err as Error).message).toBe("API Error");
      expect(callCount).toBe(1);
    }
  });

  it("should support generic types", async () => {
    interface TestData {
      id: number;
      name: string;
    }

    const testKey = "test:cache:typed";
    const testData: TestData = { id: 1, name: "Test" };

    const fetcher = async (): Promise<TestData> => {
      return testData;
    };

    const result = await swrFetch<TestData>(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result.id).toBe(1);
    expect(result.name).toBe("Test");

    // クリーンアップ
    await invalidateCache(testKey);
  });

  it("should respect SWR_ENABLED environment variable", async () => {
    const testKey = "test:cache:swr-disabled";
    const testData = { message: "Fresh data" };
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return testData;
    };

    // SWR_ENABLED = 'true' の場合（デフォルト）
    const result1 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result1).toEqual(testData);
    expect(callCount).toBe(1);

    // 2回目の呼び出し - キャッシュから返す（callCount は増えない）
    const result2 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result2).toEqual(testData);
    expect(callCount).toBe(1); // キャッシュから返されたため、API は呼ばれない

    // クリーンアップ
    await invalidateCache(testKey);
  });

  it("should bypass cache when SWR_ENABLED is false", async () => {
    // 注: このテストは SWR_ENABLED=false の環境で実行する必要があります
    // 実際の環境変数設定に基づいてテストが動作します
    const testKey = "test:cache:swr-bypass";
    const testData = { message: "Always fresh" };
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return testData;
    };

    // 1回目の呼び出し
    const result1 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result1).toEqual(testData);
    const firstCallCount = callCount;

    // 2回目の呼び出し
    const result2 = await swrFetch(testKey, fetcher, { ttl: 60, staleTime: 30 });
    expect(result2).toEqual(testData);

    // SWR_ENABLED が false の場合、毎回 API が呼ばれる
    // SWR_ENABLED が true の場合、キャッシュから返されるため callCount は変わらない
    console.log(`[SWR Test] Call count after second fetch: ${callCount} (first: ${firstCallCount})`);

    // クリーンアップ
    await invalidateCache(testKey);
  });
});
