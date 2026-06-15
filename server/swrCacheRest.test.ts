import { describe, it, expect } from "vitest";
import { swrFetch, invalidateCache } from "./swrCacheRest";

describe("SWR Cache (Upstash REST API)", () => {
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
});
