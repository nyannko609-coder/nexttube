import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("YouTube API Keys", () => {
  it("should have all 13 API keys configured", () => {
    const keys = [
      ENV.youtubeApiKey1,
      ENV.youtubeApiKey2,
      ENV.youtubeApiKey3,
      ENV.youtubeApiKey4,
      ENV.youtubeApiKey5,
      ENV.youtubeApiKey6,
      ENV.youtubeApiKey7,
      ENV.youtubeApiKey8,
      ENV.youtubeApiKey9,
      ENV.youtubeApiKey10,
      ENV.youtubeApiKey11,
      ENV.youtubeApiKey12,
      ENV.youtubeApiKey13,
    ];

    // Check that all keys are defined and not empty
    keys.forEach((key, index) => {
      expect(key).toBeDefined();
      expect(key).not.toBe("");
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    });

    // Check that all keys are unique
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(13);
  });

  it("should validate API key format", () => {
    const keys = [
      ENV.youtubeApiKey1,
      ENV.youtubeApiKey2,
      ENV.youtubeApiKey3,
      ENV.youtubeApiKey4,
      ENV.youtubeApiKey5,
      ENV.youtubeApiKey6,
      ENV.youtubeApiKey7,
      ENV.youtubeApiKey8,
      ENV.youtubeApiKey9,
      ENV.youtubeApiKey10,
      ENV.youtubeApiKey11,
      ENV.youtubeApiKey12,
      ENV.youtubeApiKey13,
    ];

    // YouTube API keys are typically alphanumeric strings starting with "AIza"
    keys.forEach((key) => {
      expect(key).toMatch(/^AIza[a-zA-Z0-9_-]+$/);
    });
  });
});
