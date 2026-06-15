import { redis } from "./server/redis";

async function clearCache() {
  try {
    const keys = await redis.keys("related:*");
    console.log("Found keys:", keys);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log("Deleted", keys.length, "cache entries");
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
  } finally {
    await redis.quit();
  }
}

clearCache();
