import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Stripe customer ID for payment processing */
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  /** Stripe payment intent ID for tracking payments */
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  /** Whether user has completed payment (purchased access) */
  hasPaid: int("has_paid").default(0).notNull(), // 1 = paid, 0 = not paid
  /** Date when user completed payment */
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API Key Management Table
 * Tracks usage and quota for each YouTube Data API key
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  keyNumber: int("key_number").notNull().unique(), // 1-25
  keyValue: text("key_value").notNull(),
  isActive: int("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  quotaUsed: int("quota_used").default(0).notNull(), // Daily quota used
  quotaLimit: int("quota_limit").default(10000).notNull(), // Daily quota limit
  lastResetAt: timestamp("last_reset_at").defaultNow().notNull(), // Last reset time (JST 17:00)
  errorCount: int("error_count").default(0).notNull(),
  lastErrorAt: timestamp("last_error_at"),
  lastErrorMessage: text("last_error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * User Profile Extension
 * Additional user information for YouTube clone
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  bannerUrl: varchar("banner_url", { length: 512 }),
  subscriberCount: int("subscriber_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Watch History
 * Tracks videos watched by users
 */
export const watchHistory = mysqlTable("watch_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  videoId: varchar("video_id", { length: 64 }).notNull(),
  videoTitle: text("video_title"),
  channelId: varchar("channel_id", { length: 64 }),
  channelTitle: varchar("channel_title", { length: 255 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WatchHistory = typeof watchHistory.$inferSelect;
export type InsertWatchHistory = typeof watchHistory.$inferInsert;

/**
 * Favorites
 * User's favorite videos
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  videoId: varchar("video_id", { length: 64 }).notNull(),
  videoTitle: text("video_title"),
  channelId: varchar("channel_id", { length: 64 }),
  channelTitle: varchar("channel_title", { length: 255 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Playlists
 * User-created playlists
 */
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  isPublic: int("is_public").default(0).notNull(), // 1 = public, 0 = private
  itemCount: int("item_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * Playlist Items
 * Videos in playlists
 */
export const playlistItems = mysqlTable("playlist_items", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull(),
  videoId: varchar("video_id", { length: 64 }).notNull(),
  videoTitle: text("video_title"),
  channelId: varchar("channel_id", { length: 64 }),
  channelTitle: varchar("channel_title", { length: 255 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  position: int("position").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = typeof playlistItems.$inferInsert;

/**
 * Video Cache
 * Caches video metadata to reduce API calls
 */
export const videoCache = mysqlTable("video_cache", {
  id: int("id").autoincrement().primaryKey(),
  videoId: varchar("video_id", { length: 64 }).notNull().unique(),
  title: text("title"),
  description: text("description"),
  channelId: varchar("channel_id", { length: 64 }),
  channelTitle: varchar("channel_title", { length: 255 }),
  publishedAt: timestamp("published_at"),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  viewCount: int("view_count").default(0).notNull(),
  likeCount: int("like_count").default(0).notNull(),
  commentCount: int("comment_count").default(0).notNull(),
  duration: varchar("duration", { length: 32 }),
  cacheExpiredAt: timestamp("cache_expired_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VideoCache = typeof videoCache.$inferSelect;
export type InsertVideoCache = typeof videoCache.$inferInsert;

/**
 * User Settings
 * Stores user preferences and settings
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  thumbnailQuality: varchar("thumbnail_quality", { length: 32 }).default("ultra").notNull(), // low, medium, high, ultra, maximum
  language: varchar("language", { length: 10 }).default("ja").notNull(), // ja, en
  theme: varchar("theme", { length: 32 }).default("dark").notNull(), // dark, light
  shareButtonMode: varchar("share_button_mode", { length: 32 }).default("clipboard").notNull(), // clipboard, dialog
  autoplay: int("autoplay").default(1).notNull(), // 1 = enabled, 0 = disabled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Subscriptions
 * User's subscribed channels
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  channelId: varchar("channel_id", { length: 64 }).notNull(),
  channelTitle: varchar("channel_title", { length: 255 }),
  channelThumbnailUrl: varchar("channel_thumbnail_url", { length: 512 }),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Video Watch Time
 * Tracks how many minutes of each video the user has watched
 */
export const videoWatchTime = mysqlTable("video_watch_time", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  videoId: varchar("video_id", { length: 64 }).notNull(),
  watchedMinutes: int("watched_minutes").default(0).notNull(), // Minutes watched
  totalDurationMinutes: int("total_duration_minutes"), // Total video duration
  lastWatchedAt: timestamp("last_watched_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VideoWatchTime = typeof videoWatchTime.$inferSelect;
export type InsertVideoWatchTime = typeof videoWatchTime.$inferInsert;
