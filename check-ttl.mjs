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
    const keys = await redis.keys("*");
    console.log(`\n📊 Redis キャッシュの TTL 設定\n`);
    console.log(`合計キー数: ${keys.length}\n`);
    
    const ttlMap = {};
    
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      
      // キーの種類を分類
      let type = "その他";
      if (key.startsWith("search:")) type = "search（検索結果）";
      else if (key.startsWith("comments:")) type = "comments（コメント）";
      else if (key.startsWith("details:")) type = "details（動画詳細）";
      else if (key.startsWith("related:")) type = "related（関連動画）";
      
      if (!ttlMap[type]) {
        ttlMap[type] = [];
      }
      ttlMap[type].push({ key, ttl });
    }
    
    // TTL ごとに集計
    console.log("📋 キャッシュの種類と TTL：\n");
    
    for (const [type, items] of Object.entries(ttlMap)) {
      const ttls = items.map(item => item.ttl);
      const avgTtl = Math.round(ttls.reduce((a, b) => a + b, 0) / ttls.length);
      const minTtl = Math.min(...ttls);
      const maxTtl = Math.max(...ttls);
      
      console.log(`${type}`);
      console.log(`  個数: ${items.length}`);
      console.log(`  平均 TTL: ${avgTtl}秒 (${Math.round(avgTtl / 60)}分)`);
      console.log(`  最小 TTL: ${minTtl}秒`);
      console.log(`  最大 TTL: ${maxTtl}秒 (${Math.round(maxTtl / 60)}分)`);
      console.log();
    }
    
    // 実装コードから確認
    console.log("💡 実装での TTL 設定：\n");
    console.log("swrCache.ts のデフォルト設定：");
    console.log("  - ttl: 600秒（10分）");
    console.log("  - staleTime: 300秒（5分）");
    console.log("\nserver/routers.ts での設定：");
    console.log("  - search: 1800秒（30分）");
    console.log("  - comments: 600秒（10分）");
    console.log("  - details: 3600秒（60分）");
    console.log("  - related: 1800秒（30分）");
    
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
