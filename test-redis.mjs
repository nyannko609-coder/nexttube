import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
console.log("Testing Redis connection...");
console.log("URL:", redisUrl);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  tls: {},
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

// Test set/get
setTimeout(async () => {
  try {
    await redis.set("test-key", "test-value", "EX", 60);
    console.log("✅ SET successful");
    
    const value = await redis.get("test-key");
    console.log("✅ GET successful:", value);
    
    await redis.del("test-key");
    console.log("✅ DEL successful");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}, 1000);

setTimeout(() => {
  console.error("❌ Connection timeout");
  process.exit(1);
}, 5000);
