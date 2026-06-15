import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userSettings, InsertUserSettings, UserSettings, videoWatchTime, InsertVideoWatchTime, VideoWatchTime } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSettingsByUserId(userId: number): Promise<UserSettings | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user settings: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user settings:", error);
    return undefined;
  }
}

export async function upsertUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user settings: database not available");
    return undefined;
  }

  try {
    const values: InsertUserSettings = {
      userId,
      ...settings,
    };

    const updateSet: Record<string, unknown> = {};
    if (settings.thumbnailQuality !== undefined) updateSet.thumbnailQuality = settings.thumbnailQuality;
    if (settings.language !== undefined) updateSet.language = settings.language;
    if (settings.theme !== undefined) updateSet.theme = settings.theme;
    if (settings.shareButtonMode !== undefined) updateSet.shareButtonMode = settings.shareButtonMode;
    if (settings.autoplay !== undefined) updateSet.autoplay = settings.autoplay;

    await db.insert(userSettings).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    return getUserSettingsByUserId(userId);
  } catch (error) {
    console.error("[Database] Failed to upsert user settings:", error);
    return undefined;
  }
}

// Video Watch Time queries
export async function saveWatchTime(userId: number, videoId: string, watchedMinutes: number, totalDurationMinutes?: number): Promise<VideoWatchTime | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save watch time: database not available");
    return undefined;
  }

  try {
    const values: InsertVideoWatchTime = {
      userId,
      videoId,
      watchedMinutes,
      totalDurationMinutes,
    };

    const updateSet: Record<string, unknown> = {
      watchedMinutes,
      lastWatchedAt: new Date(),
    };
    if (totalDurationMinutes !== undefined) {
      updateSet.totalDurationMinutes = totalDurationMinutes;
    }

    await db.insert(videoWatchTime).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    return getWatchTime(userId, videoId);
  } catch (error) {
    console.error("[Database] Failed to save watch time:", error);
    return undefined;
  }
}

export async function getWatchTime(userId: number, videoId: string): Promise<VideoWatchTime | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get watch time: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(videoWatchTime)
      .where(
        and(
          eq(videoWatchTime.userId, userId),
          eq(videoWatchTime.videoId, videoId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get watch time:", error);
    return undefined;
  }
}

export async function getAllWatchTimes(userId: number): Promise<VideoWatchTime[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get watch times: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(videoWatchTime)
      .where(eq(videoWatchTime.userId, userId))
      .orderBy(desc(videoWatchTime.lastWatchedAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get watch times:", error);
    return [];
  }
}

// TODO: add feature queries here as your schema grows.
