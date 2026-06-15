import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  tls: {},
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
  process.exit(1);
});

setTimeout(async () => {
  try {
    const testKey = "test-swr-" + Date.now();
    const testData = { data: "test", updatedAt: Date.now() };
    
    console.log(`\n🔍 Test 1: キャッシュに保存`);
    await redis.set(testKey, JSON.stringify(testData), "EX", 60);
    console.log(`✅ キー保存: ${testKey}`);
    
    console.log(`\n🔍 Test 2: 即座に取得`);
    const cached1 = await redis.get(testKey);
    console.log(`✅ 取得成功: ${cached1 ? "あり" : "なし"}`);
    
    console.log(`\n🔍 Test 3: 1秒後に取得`);
    await new Promise(r => setTimeout(r, 1000));
    const cached2 = await redis.get(testKey);
    console.log(`✅ 取得成功: ${cached2 ? "あり" : "なし"}`);
    
    console.log(`\n🔍 Test 4: TTL 確認`);
    const ttl = await redis.ttl(testKey);
    console.log(`✅ 残り TTL: ${ttl}秒`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ エラー:", err.message);
    process.exit(1);
  }
}, 1000);

setTimeout(() => {
  console.error("❌ タイムアウト");
  process.exit(1);
}, 10000);
