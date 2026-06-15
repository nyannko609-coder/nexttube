import { getDb } from "./db";
import {
  watchHistory,
  favorites,
  playlists,
  playlistItems,
  videoCache,
  userProfiles,
  subscriptions,
  InsertWatchHistory,
  InsertFavorite,
  InsertPlaylist,
  InsertPlaylistItem,
  InsertVideoCache,
  InsertUserProfile,
  InsertSubscription,
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Video Database Helpers
 * Query helpers for video-related operations
 */

// Watch History
export async function addToWatchHistory(data: InsertWatchHistory): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(watchHistory).values(data);
}

export async function getWatchHistory(userId: number, limitCount: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(limitCount);
}

// Favorites
export async function addToFavorites(data: InsertFavorite): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(favorites).values(data);
}

export async function removeFromFavorites(
  userId: number,
  videoId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.videoId, videoId)));
}

export async function getFavorites(userId: number, limitCount: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.addedAt))
    .limit(limitCount);
}

export async function isFavorite(userId: number, videoId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.videoId, videoId)))
    .limit(1);
  return result.length > 0;
}

// Playlists
export async function createPlaylist(data: InsertPlaylist): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playlists).values(data);
}

export async function getPlaylists(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(playlists)
    .where(eq(playlists.userId, userId))
    .orderBy(desc(playlists.createdAt));
}

export async function getPlaylistById(playlistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePlaylist(
  playlistId: number,
  data: Partial<InsertPlaylist>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(playlists).set(data).where(eq(playlists.id, playlistId));
}

export async function deletePlaylist(playlistId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(playlists).where(eq(playlists.id, playlistId));
}

// Playlist Items
export async function addToPlaylist(data: InsertPlaylistItem): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playlistItems).values(data);

  // Update playlist item count
  const playlist = await getPlaylistById(data.playlistId);
  if (playlist) {
    await updatePlaylist(data.playlistId, {
      itemCount: playlist.itemCount + 1,
    });
  }
}

export async function removeFromPlaylist(
  playlistId: number,
  videoId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(playlistItems)
    .where(
      and(
        eq(playlistItems.playlistId, playlistId),
        eq(playlistItems.videoId, videoId)
      )
    );

  // Update playlist item count
  const playlist = await getPlaylistById(playlistId);
  if (playlist && playlist.itemCount > 0) {
    await updatePlaylist(playlistId, {
      itemCount: playlist.itemCount - 1,
    });
  }
}

export async function getPlaylistItems(playlistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, playlistId))
    .orderBy(playlistItems.position);
}

// Video Cache
export async function cacheVideo(data: InsertVideoCache): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(videoCache)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        title: data.title,
        description: data.description,
        viewCount: data.viewCount,
        likeCount: data.likeCount,
        commentCount: data.commentCount,
        updatedAt: new Date(),
      },
    });
}

export async function getCachedVideo(videoId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(videoCache)
    .where(eq(videoCache.videoId, videoId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// User Profile
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateUserProfile(
  data: InsertUserProfile
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(userProfiles)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        subscriberCount: data.subscriberCount,
        updatedAt: new Date(),
      },
    });
}


export async function removeFromWatchHistory(
  userId: number,
  videoId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(watchHistory)
    .where(and(eq(watchHistory.userId, userId), eq(watchHistory.videoId, videoId)));
}

// Subscriptions
export async function addToSubscriptions(data: InsertSubscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values(data);
}

export async function removeFromSubscriptions(
  userId: number,
  channelId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, channelId)));
}

export async function getSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.subscribedAt));
}
