import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios from "axios";

describe("Upstash Redis REST API Connection", () => {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  let upstashClient: any;

  beforeAll(() => {
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
    }

    upstashClient = axios.create({
      baseURL: UPSTASH_URL,
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });
  });

  it("should connect to Upstash and set a test key", async () => {
    const testKey = `test-key-${Date.now()}`;
    const testValue = "test-value";

    const response = await upstashClient.post(`/set/${testKey}`, [testValue, "EX", 60]);
    expect(response.status).toBe(200);
    expect(response.data.result).toBe("OK");
  });

  it("should retrieve the test key from Upstash", async () => {
    const testKey = `test-key-${Date.now()}`;
    const testValue = "test-value";

    // Set the key first
    await upstashClient.post(`/set/${testKey}`, [testValue, "EX", 60]);

    // Retrieve the key
    const response = await upstashClient.get(`/get/${testKey}`);
    expect(response.status).toBe(200);
    expect(response.data.result).toBe(testValue);
  });

  it("should delete a test key from Upstash", async () => {
    const testKey = `test-key-${Date.now()}`;
    const testValue = "test-value";

    // Set the key first
    await upstashClient.post(`/set/${testKey}`, [testValue, "EX", 60]);

    // Delete the key
    const deleteResponse = await upstashClient.post(`/del/${testKey}`);
    expect(deleteResponse.status).toBe(200);

    // Verify the key is deleted
    const getResponse = await upstashClient.get(`/get/${testKey}`);
    expect(getResponse.data.result).toBeNull();
  });

  it("should handle cache operations correctly", async () => {
    const cacheKey = `cache-test-${Date.now()}`;
    const cacheData = JSON.stringify({ message: "Hello, Upstash!" });

    // Set cache
    const setResponse = await upstashClient.post(`/set/${cacheKey}`, [cacheData, "EX", 600]);
    expect(setResponse.status).toBe(200);

    // Get cache
    const getResponse = await upstashClient.get(`/get/${cacheKey}`);
    expect(getResponse.status).toBe(200);
    expect(JSON.parse(getResponse.data.result)).toEqual({ message: "Hello, Upstash!" });

    // Clean up
    await upstashClient.post(`/del/${cacheKey}`);
  });
});
