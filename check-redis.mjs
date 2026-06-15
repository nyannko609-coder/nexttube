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
    // すべてのキーを取得
    const keys = await redis.keys("*");
    console.log(`\n📊 Redis に保存されているキー数: ${keys.length}\n`);
    
    if (keys.length === 0) {
      console.log("Redis は空です（キャッシュなし）");
    } else {
      console.log("保存されているキー一覧：");
      for (const key of keys.slice(0, 20)) {
        const value = await redis.get(key);
        const ttl = await redis.ttl(key);
        console.log(`\n🔑 キー: ${key}`);
        console.log(`   TTL: ${ttl}秒`);
        
        // 値をパース（JSON の場合）
        try {
          const parsed = JSON.parse(value);
          console.log(`   データ型: ${typeof parsed.data}`);
          if (typeof parsed.data === 'object') {
            console.log(`   データサイズ: ${JSON.stringify(parsed.data).length} bytes`);
            if (Array.isArray(parsed.data)) {
              console.log(`   配列要素数: ${parsed.data.length}`);
            }
          }
        } catch {
          console.log(`   値: ${value?.substring(0, 100)}`);
        }
      }
      
      if (keys.length > 20) {
        console.log(`\n... 他 ${keys.length - 20} 個のキー`);
      }
    }
    
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
