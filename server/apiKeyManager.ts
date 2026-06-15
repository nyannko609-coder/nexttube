import { ENV } from "./_core/env";
import { getDb } from "./db";
import { apiKeys } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";

/**
 * API Key Manager
 * Manages YouTube Data API keys, quota tracking, and automatic key rotation
 */

// All 24 API keys from environment variables
const ALL_API_KEYS = [
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
  ENV.youtubeApiKey14,
  ENV.youtubeApiKey15,
  ENV.youtubeApiKey16,
  ENV.youtubeApiKey17,
  ENV.youtubeApiKey18,
  ENV.youtubeApiKey19,
  ENV.youtubeApiKey20,
  ENV.youtubeApiKey21,
  ENV.youtubeApiKey22,
  ENV.youtubeApiKey23,
  ENV.youtubeApiKey24,
  ENV.youtubeApiKey25,
];

const DAILY_QUOTA_LIMIT = 10000;
const QUOTA_COST_SEARCH = 100;
const QUOTA_COST_VIDEO_GET = 1;
const QUOTA_COST_COMMENT_LIST = 1;

/**
 * Initialize API keys in database
 * Should be called once during application startup
 */
export async function initializeApiKeys(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return;
  }

  try {
    // Check if keys are already initialized
    const existingKeys = await db.select().from(apiKeys).limit(1);
    if (existingKeys.length > 0) {
      console.log("[APIKeyManager] API keys already initialized");
      return;
    }

    // Insert all 13 API keys
    for (let i = 0; i < ALL_API_KEYS.length; i++) {
      const keyNumber = i + 1;
      const keyValue = ALL_API_KEYS[i];

      if (!keyValue) {
        console.warn(`[APIKeyManager] API key ${keyNumber} is not configured`);
        continue;
      }

      await db.insert(apiKeys).values({
        keyNumber,
        keyValue,
        isActive: 1,
        quotaUsed: 0,
        quotaLimit: DAILY_QUOTA_LIMIT,
        lastResetAt: new Date(),
        errorCount: 0,
      });
    }

    console.log("[APIKeyManager] API keys initialized successfully");
  } catch (error) {
    console.error("[APIKeyManager] Failed to initialize API keys:", error);
    throw error;
  }
}

/**
 * Get the next available API key for use
 * Automatically rotates to the next key if quota is exceeded
 * Returns both the key value and its number
 */
export async function getAvailableApiKey(): Promise<{ key: string; keyNumber: number } | null> {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return null;
  }

  try {
    // Find the first active key (no quota check needed)
    const availableKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.isActive, 1))
      .orderBy(apiKeys.keyNumber)
      .limit(1);

    if (availableKey.length === 0) {
      console.warn("[APIKeyManager] No available API keys");
      return null;
    }

    const selectedKey = availableKey[0];
    console.log(`[APIKeyManager] Selected API key ${selectedKey.keyNumber}`);
    return {
      key: selectedKey.keyValue,
      keyNumber: selectedKey.keyNumber,
    };
  } catch (error) {
    console.error("[APIKeyManager] Failed to get available API key:", error);
    return null;
  }
}

/**
 * Track API quota usage
 */
export async function trackQuotaUsage(
  keyNumber: number,
  quotaCost: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return;
  }

  try {
    const key = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyNumber, keyNumber))
      .limit(1);

    if (key.length === 0) {
      console.warn(`[APIKeyManager] API key ${keyNumber} not found`);
      return;
    }

    const currentKey = key[0];
    const newQuotaUsed = currentKey.quotaUsed + quotaCost;

    // Update quota usage (tracking only, no automatic deactivation)
    await db
      .update(apiKeys)
      .set({
        quotaUsed: newQuotaUsed,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.keyNumber, keyNumber));

    // Log quota usage for monitoring
    console.log(
      `[APIKeyManager] API key ${keyNumber} quota usage: ${newQuotaUsed}/${currentKey.quotaLimit}`
    );
  } catch (error) {
    console.error("[APIKeyManager] Failed to track quota usage:", error);
  }
}

/**
 * Record API error
 */
export async function recordApiError(
  keyNumber: number,
  errorMessage: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return;
  }

  try {
    const key = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyNumber, keyNumber))
      .limit(1);

    if (key.length === 0) {
      console.warn(`[APIKeyManager] API key ${keyNumber} not found`);
      return;
    }

    const currentKey = key[0];

    // エラーが出たら即座にキーを無効化
    console.warn(
      `[APIKeyManager] API key ${keyNumber} error: ${errorMessage} - deactivating key immediately`
    );
    await db
      .update(apiKeys)
      .set({
        isActive: 0,
        errorCount: currentKey.errorCount + 1,
        lastErrorAt: new Date(),
        lastErrorMessage: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.keyNumber, keyNumber));
    console.log(`[APIKeyManager] API key ${keyNumber} has been deactivated`);
    console.log(`[APIKeyManager] Next request will use the next available key`);

  } catch (error) {
    console.error("[APIKeyManager] Failed to record API error:", error);
  }
}

/**
 * Reset daily quota for all keys (called at JST 17:00)
 * Resets quota usage and error counts for all keys,
 * re-activates all keys, and ensures key #1 is used first
 */
export async function resetDailyQuota(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return;
  }

  try {
    // Reset all keys: clear quota, errors, and re-activate all keys
    await db
      .update(apiKeys)
      .set({
        quotaUsed: 0,
        errorCount: 0,
        isActive: 1,
        lastResetAt: new Date(),
        lastErrorAt: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      });

    console.log("[APIKeyManager] Daily quota reset completed. All keys re-activated, starting from key #1");
  } catch (error) {
    console.error("[APIKeyManager] Failed to reset daily quota:", error);
    throw error;
  }
}

/**
 * Get API key status for management dashboard
 */
export async function getApiKeyStatus() {
  const db = await getDb();
  if (!db) {
    console.error("[APIKeyManager] Database not available");
    return [];
  }

  try {
    const keys = await db.select().from(apiKeys).orderBy(apiKeys.keyNumber);
    return keys.map((key) => ({
      keyNumber: key.keyNumber,
      isActive: key.isActive === 1,
      quotaUsed: key.quotaUsed,
      quotaLimit: key.quotaLimit,
      quotaRemaining: Math.max(0, key.quotaLimit - key.quotaUsed),
      quotaPercentage: Math.round((key.quotaUsed / key.quotaLimit) * 100),
      errorCount: key.errorCount,
      lastErrorAt: key.lastErrorAt,
      lastErrorMessage: key.lastErrorMessage,
      lastResetAt: key.lastResetAt,
    }));
  } catch (error) {
    console.error("[APIKeyManager] Failed to get API key status:", error);
    return [];
  }
}

/**
 * Get quota cost for different API operations
 */
export function getQuotaCost(operation: string): number {
  switch (operation) {
    case "search":
      return QUOTA_COST_SEARCH;
    case "video.get":
      return QUOTA_COST_VIDEO_GET;
    case "comment.list":
      return QUOTA_COST_COMMENT_LIST;
    default:
      return 1;
  }
}
