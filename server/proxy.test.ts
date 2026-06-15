import { describe, it, expect } from "vitest";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

describe("Proxy Connection Test", () => {
  it("should connect to YouTube API through proxy", async () => {
    const PROXY_URL = process.env.HTTP_PROXY;
    
    if (!PROXY_URL) {
      console.log("No proxy configured, skipping test");
      return;
    }

    console.log(`Testing proxy: ${PROXY_URL}`);
    
    const proxyAgent = new HttpsProxyAgent(PROXY_URL);
    
    try {
      // Test with a simple YouTube API request
      const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          key: process.env.YOUTUBE_API_KEY_1,
          id: "dQw4w9WgXcQ",
          part: "snippet",
        },
        httpsAgent: proxyAgent,
        timeout: 10000, // 10 second timeout
      });

      expect(response.status).toBe(200);
      expect(response.data.items).toBeDefined();
      expect(response.data.items.length).toBeGreaterThan(0);
      
      console.log("✅ Proxy connection successful!");
      console.log(`Video title: ${response.data.items[0].snippet.title}`);
    } catch (error: any) {
      console.error("❌ Proxy connection failed:", error.message);
      
      if (error.code === "ECONNREFUSED") {
        throw new Error("Proxy refused connection - proxy may be offline");
      } else if (error.code === "ETIMEDOUT") {
        throw new Error("Proxy connection timed out - proxy may be too slow");
      } else if (error.response?.status === 403) {
        throw new Error("YouTube API blocked the request - proxy may be blacklisted");
      } else {
        throw error;
      }
    }
  }, 15000); // 15 second test timeout
});
