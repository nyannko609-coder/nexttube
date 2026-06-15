import { describe, it, expect, vi, beforeEach } from "vitest";
import * as youtubeProxyApi from "./_core/youtubeProxyApi";
import * as apiKeyManager from "./apiKeyManager";

// Mock apiKeyManager
vi.mock("./apiKeyManager");

describe("YouTube API V3 Proxy API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchVideos", () => {
    it("should return response with success property", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue({
        key: "mock-api-key",
        keyNumber: 1,
      });

      vi.mocked(apiKeyManager.trackQuotaUsage).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.searchVideos("test query", 20);

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle missing API key", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue(null);

      const result = await youtubeProxyApi.searchVideos("test query", 20);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No available API keys");
    });
  });

  describe("getVideoDetails", () => {
    it("should accept single video ID", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue({
        key: "mock-api-key",
        keyNumber: 1,
      });

      vi.mocked(apiKeyManager.trackQuotaUsage).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.getVideoDetails("dQw4w9WgXcQ");

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should accept multiple video IDs", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue({
        key: "mock-api-key",
        keyNumber: 1,
      });

      vi.mocked(apiKeyManager.trackQuotaUsage).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.getVideoDetails([
        "dQw4w9WgXcQ",
        "jNQXAC9IVRw",
      ]);

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("getChannelInfo", () => {
    it("should accept single channel ID", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue({
        key: "mock-api-key",
        keyNumber: 1,
      });

      vi.mocked(apiKeyManager.trackQuotaUsage).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.getChannelInfo("UCuAXFkgsw1L7xaCfnd5J1Pw");

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("should accept multiple channel IDs", async () => {
      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue({
        key: "mock-api-key",
        keyNumber: 1,
      });

      vi.mocked(apiKeyManager.trackQuotaUsage).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.getChannelInfo([
        "UCuAXFkgsw1L7xaCfnd5J1Pw",
        "UCBR8-60-B8q_2La_hu5QyAQ",
      ]);

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("API Key Rotation", () => {
    it("should retry with next API key on error", async () => {
      const mockApiKeyData = {
        key: "mock-api-key",
        keyNumber: 1,
      };

      vi.mocked(apiKeyManager.getAvailableApiKey).mockResolvedValue(
        mockApiKeyData
      );

      vi.mocked(apiKeyManager.recordApiError).mockResolvedValue(undefined);

      const result = await youtubeProxyApi.searchVideos("test", 20);

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });
  });
});
