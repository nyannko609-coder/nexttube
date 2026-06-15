import { COOKIE_NAME } from "@shared/const";
import { getDb, getUserSettingsByUserId, upsertUserSettings } from "./db";
import { subscriptions, apiKeys } from "../drizzle/schema";
import { eq, ne } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  searchVideos,
  getVideoDetails,
  getChannelInfo,
  getVideoComments,
  getRelatedVideos,
  getChannelVideos,
} from "./youtubeApi";
import { getApiKeyStatus, resetDailyQuota } from "./apiKeyManager";
import { createCheckoutSession, getUserPaymentStatus } from "./stripe";
import { invalidateCachePattern } from "./swrCache";
import {
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isFavorite,
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  getPlaylistItems,
  addToSubscriptions,
  removeFromSubscriptions,
  getSubscriptions,
} from "./videoDb";
import { saveWatchTime, getWatchTime, getAllWatchTimes } from "./db";
import { swrFetch } from "./swrCache";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // YouTube API and Video Management
  video: router({
    search: publicProcedure
      .input(
        z.object({
          query: z.string(),
          maxResults: z.number().default(20),
          pageToken: z.string().optional(),
          order: z.enum(["relevance", "date", "viewCount"]).default("relevance"),
          thumbnailQuality: z.enum(["default", "medium", "high", "maxhigh", "ultra"]).default("high"),
        })
      )
      .query(async ({ input }) => {
        // SWR cache key: search:{query}:{maxResults}:{pageToken}:{order}
        const cacheKey = `search:${input.query}:${input.maxResults}:${input.pageToken || 'initial'}:${input.order}`;
        
        return swrFetch(
          cacheKey,
          () => searchVideos(input.query, input.maxResults, input.pageToken, input.order, input.thumbnailQuality),
          {
            ttl: 1800, // 30 minutes
            staleTime: 600, // 10 minutes
          }
        );
      }),

    getDetails: publicProcedure
      .input(z.object({ videoId: z.string() }))
      .query(async ({ input }) => {
        // SWR cache key: details:{videoId}
        const cacheKey = `details:${input.videoId}`;
        
        return swrFetch(
          cacheKey,
          () => getVideoDetails(input.videoId),
          {
            ttl: 3600, // 1 hour
            staleTime: 1800, // 30 minutes
          }
        );
      }),

    getComments: publicProcedure
      .input(
        z.object({
          videoId: z.string(),
          maxResults: z.number().default(20),
          pageToken: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        // SWR cache key: comments:{videoId}:{maxResults}:{pageToken}
        const cacheKey = `comments:${input.videoId}:${input.maxResults}:${input.pageToken || 'initial'}`;
        
        return swrFetch(
          cacheKey,
          () => getVideoComments(input.videoId, input.maxResults, input.pageToken),
          {
            ttl: 1800, // 30 minutes
            staleTime: 600, // 10 minutes
          }
        );
      }),

    getRelated: publicProcedure
      .input(z.object({ videoId: z.string(), maxResults: z.number().default(20), pageToken: z.string().optional() }))
      .query(async ({ input }) => {
        // SWR cache key: related:{videoId}:{maxResults}:{pageToken}
        const cacheKey = `related:${input.videoId}:${input.maxResults}:${input.pageToken || 'initial'}`;
        
        return swrFetch(
          cacheKey,
          () => getRelatedVideos(input.videoId, input.maxResults),
          {
            ttl: 1800, // 30 minutes
            staleTime: 600, // 10 minutes
          }
        );
      }),

    getChannel: publicProcedure
      .input(z.object({ channelId: z.string() }))
      .query(async ({ input }) => {
        // SWR cache key: channel:{channelId}
        const cacheKey = `channel:${input.channelId}`;
        
        return swrFetch(
          cacheKey,
          () => getChannelInfo(input.channelId),
          {
            ttl: 3600, // 1 hour
            staleTime: 1800, // 30 minutes
          }
        );
      }),

    getStreamUrl: publicProcedure
      .input(z.object({ videoId: z.string() }))
      .query(async ({ input }) => {
        try {
          const videoDetails = await getVideoDetails(input.videoId);
          if (!videoDetails) {
            throw new Error('Video not found');
          }
          return {
            videoId: input.videoId,
            streamUrl: `https://www.youtube.com/watch?v=${input.videoId}`,
            title: videoDetails.title,
            duration: videoDetails.duration,
            thumbnailUrl: videoDetails.thumbnailUrl,
          };
        } catch (error) {
          console.error('Error getting stream URL:', error);
          throw new Error('Failed to get stream URL');
        }
      }),

    addComment: protectedProcedure
      .input(
        z.object({
          videoId: z.string(),
          text: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // For now, return a mock comment since YouTube API doesn't support posting comments
        // In a real implementation, you would store this in your database
        return {
          id: `${Date.now()}`,
          videoId: input.videoId,
          authorName: ctx.user.name,
          authorProfileImageUrl: 'https://via.placeholder.com/40',
          textDisplay: input.text,
          likeCount: 0,
          publishedAt: new Date().toISOString(),
        };
      }),
  }),

  // Channel Videos
  channel: router({
    getVideos: publicProcedure
      .input(
        z.object({
          channelId: z.string(),
          maxResults: z.number().default(30),
          pageToken: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        // SWR cache key: channelVideos:{channelId}:{maxResults}:{pageToken}
        const cacheKey = `channelVideos:${input.channelId}:${input.maxResults}:${input.pageToken || 'initial'}`;
        
        return swrFetch(
          cacheKey,
          () => getChannelVideos(input.channelId, input.maxResults, input.pageToken),
          {
            ttl: 1800, // 30 minutes
            staleTime: 900, // 15 minutes
          }
        );
      }),
  }),

  // Watch History
  watchHistory: router({
    add: protectedProcedure
      .input(
        z.object({
          videoId: z.string(),
          videoTitle: z.string(),
          channelId: z.string(),
          channelTitle: z.string(),
          thumbnailUrl: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await addToWatchHistory({
          userId: ctx.user.id,
          videoId: input.videoId,
          videoTitle: input.videoTitle,
          channelId: input.channelId,
          channelTitle: input.channelTitle,
          thumbnailUrl: input.thumbnailUrl,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ videoId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeFromWatchHistory(ctx.user.id, input.videoId);
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input, ctx }) => {
        return getWatchHistory(ctx.user.id, input.limit);
      }),
  }),

  // Favorites
  favorites: router({
    add: protectedProcedure
      .input(
        z.object({
          videoId: z.string(),
          videoTitle: z.string(),
          channelId: z.string(),
          channelTitle: z.string(),
          thumbnailUrl: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await addToFavorites({
          userId: ctx.user.id,
          videoId: input.videoId,
          videoTitle: input.videoTitle,
          channelId: input.channelId,
          channelTitle: input.channelTitle,
          thumbnailUrl: input.thumbnailUrl,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ videoId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeFromFavorites(ctx.user.id, input.videoId);
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getFavorites(ctx.user.id, input.limit);
      }),

    isFavorite: protectedProcedure
      .input(z.object({ videoId: z.string() }))
      .query(async ({ input, ctx }) => {
        return isFavorite(ctx.user.id, input.videoId);
      }),
  }),

  // Subscriptions
  subscriptions: router({
    add: protectedProcedure
      .input(
        z.object({
          channelId: z.string(),
          channelTitle: z.string(),
          channelThumbnailUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        let thumbnailUrl = input.channelThumbnailUrl;
        
        // アイコンURLがない場合、YouTube APIから取得
        if (!thumbnailUrl) {
          try {
            const channelInfo = await getChannelInfo(input.channelId);
            if (channelInfo && channelInfo.thumbnailUrl) {
              thumbnailUrl = channelInfo.thumbnailUrl;
            }
          } catch (error) {
            console.error('[Subscriptions] Error fetching channel info during subscription:', error);
            // エラーでも登録は続行
          }
        }
        
        await addToSubscriptions({
          userId: ctx.user.id,
          channelId: input.channelId,
          channelTitle: input.channelTitle,
          channelThumbnailUrl: thumbnailUrl,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ channelId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeFromSubscriptions(ctx.user.id, input.channelId);
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getSubscriptions(ctx.user.id);
    }),

    refreshChannelInfo: protectedProcedure
      .input(z.object({ channelId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const channelInfo = await getChannelInfo(input.channelId);
          
          if (channelInfo && channelInfo.thumbnailUrl) {
            const db = await getDb();
            if (!db) {
              return { success: false };
            }
            
            await db
              .update(subscriptions)
              .set({
                channelThumbnailUrl: channelInfo.thumbnailUrl,
              })
              .where(
                eq(subscriptions.channelId, input.channelId)
              );
            
            return {
              success: true,
              thumbnailUrl: channelInfo.thumbnailUrl,
            };
          }
          
          return { success: false };
        } catch (error) {
          console.error('[Subscriptions] Error refreshing channel info:', error);
          return { success: false };
        }
      }),
  }),

  // Playlists
  playlists: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          isPublic: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createPlaylist({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          isPublic: input.isPublic ? 1 : 0,
          itemCount: 0,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getPlaylists(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ playlistId: z.number() }))
      .query(async ({ input }) => {
        return getPlaylistById(input.playlistId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          playlistId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updatePlaylist(input.playlistId, {
          title: input.title,
          description: input.description,
          isPublic: input.isPublic ? 1 : 0,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ playlistId: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlaylist(input.playlistId);
        return { success: true };
      }),

    addItem: protectedProcedure
      .input(
        z.object({
          playlistId: z.number(),
          videoId: z.string(),
          videoTitle: z.string(),
          channelId: z.string(),
          channelTitle: z.string(),
          thumbnailUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const items = await getPlaylistItems(input.playlistId);
        await addToPlaylist({
          playlistId: input.playlistId,
          videoId: input.videoId,
          videoTitle: input.videoTitle,
          channelId: input.channelId,
          channelTitle: input.channelTitle,
          thumbnailUrl: input.thumbnailUrl,
          position: items.length,
        });
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ playlistId: z.number(), videoId: z.string() }))
      .mutation(async ({ input }) => {
        await removeFromPlaylist(input.playlistId, input.videoId);
        return { success: true };
      }),

    getItems: protectedProcedure
      .input(z.object({ playlistId: z.number() }))
      .query(async ({ input }) => {
        return getPlaylistItems(input.playlistId);
      }),
  }),

  // API Management - Admin only
  apiManagement: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return getApiKeyStatus();
    }),
    setActiveKey: protectedProcedure
      .input(z.object({ keyNumber: z.number().min(1).max(25) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }
        await db.update(apiKeys).set({ isActive: 0 }).where(ne(apiKeys.keyNumber, input.keyNumber));
        await db.update(apiKeys).set({ isActive: 1 }).where(eq(apiKeys.keyNumber, input.keyNumber));
        return { success: true, selectedKey: input.keyNumber };
      }),
    resetQuota: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      await resetDailyQuota();
      // キャッシュを無効化
      await invalidateCachePattern('search:*');
      await invalidateCachePattern('related:*');
      await invalidateCachePattern('details:*');
      return { success: true };
    }),
    clearCache: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      // すべてのキャッシュを無効化
      await invalidateCachePattern('search:*');
      await invalidateCachePattern('related:*');
      await invalidateCachePattern('details:*');
      return { success: true, message: 'Cache cleared' };
    }),
  }),

  // Payment - Stripe
  payment: router({
    createCheckout: protectedProcedure
      .input(z.object({ origin: z.string(), amount: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id || !ctx.user?.email || !ctx.user?.name) {
          throw new Error('User not authenticated or missing required fields');
        }
        // Use provided amount or default to $1.00 (100 cents)
        const amountInCents = input.amount || 100;
        const result = await createCheckoutSession(
          ctx.user.id,
          ctx.user.email,
          ctx.user.name,
          input.origin,
          amountInCents
        );
        return result;
      }),

    getStatus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }
      return getUserPaymentStatus(ctx.user.id);
    }),
  }),

  // Video Watch Time
  watchTime: router({
    save: protectedProcedure
      .input(z.object({
        videoId: z.string(),
        watchedMinutes: z.number().min(0),
        totalDurationMinutes: z.number().min(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error('User not authenticated');
        }
        return saveWatchTime(ctx.user.id, input.videoId, input.watchedMinutes, input.totalDurationMinutes);
      }),
    get: protectedProcedure
      .input(z.object({ videoId: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error('User not authenticated');
        }
        return getWatchTime(ctx.user.id, input.videoId);
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }
      return getAllWatchTimes(ctx.user.id);
    }),
  }),

    // User Settings
  settings: router({
    get: publicProcedure.query(async ({ ctx }) => {
      // If user is not authenticated, return default settings with English language
      if (!ctx.user?.id) {
        return {
          userId: null,
          thumbnailQuality: 'ultra',
          language: 'en',
          theme: 'dark',
          autoplay: 1,
        };
      }
      // If user is authenticated, return their personal settings
      const settings = await getUserSettingsByUserId(ctx.user.id);
      return settings || {
        userId: ctx.user.id,
        thumbnailQuality: 'ultra',
        language: 'en',
        theme: 'dark',
        autoplay: 1,
      };
    }),
    update: protectedProcedure
      .input(
        z.object({
          thumbnailQuality: z.enum(['low', 'medium', 'high', 'ultra', 'maximum']).optional(),
          language: z.enum(['ja', 'en']).optional(),
          theme: z.enum(['dark', 'light']).optional(),
          shareButtonMode: z.enum(['clipboard', 'dialog']).optional(),
          autoplay: z.number().min(0).max(1).optional(),
        }).strict().partial()
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error('User not authenticated');
        }
        const settings = await upsertUserSettings(ctx.user.id, input);
        return settings || { success: false };
      }),
  }),
});

export type AppRouter = typeof appRouter;
