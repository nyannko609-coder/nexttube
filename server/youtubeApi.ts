import axios from "axios";
import { cacheVideo, getCachedVideo } from "./videoDb";
import { swrFetch } from "./swrCache";
import { ENV } from "./_core/env";

/**
 * YouTube Data API V3 Integration with Multiple API Keys
 * Automatically rotates through 24 API keys on error
 */

// Get all available API keys from environment variables
function getAllApiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 24; i++) {
    const key = (ENV as any)[`youtubeApiKey${i}`];
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

let apiKeys = getAllApiKeys();
let currentKeyIndex = 0;
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelThumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

interface SearchResult {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

/**
 * Get the current available API key
 */
function getCurrentApiKey(): string {
  if (apiKeys.length === 0) {
    throw new Error("No YouTube API keys available");
  }
  return apiKeys[currentKeyIndex % apiKeys.length];
}

/**
 * Switch to the next API key
 */
function switchToNextKey(): void {
  if (apiKeys.length === 0) return;
  currentKeyIndex++;
  const nextKey = getCurrentApiKey();
  console.log(`[YouTubeAPI] Switched to API key index: ${currentKeyIndex % apiKeys.length}`);
}

/**
 * Search for videos on YouTube using YouTube Data API V3
 */
export async function searchVideos(
  query: string,
  maxResults: number = 20,
  pageToken?: string,
  order: "relevance" | "date" | "viewCount" = "relevance",
  thumbnailQuality: "default" | "medium" | "high" | "maxhigh" | "ultra" = "high"
): Promise<{
  items: SearchResult[];
  nextPageToken?: string;
  totalResults: number;
}> {
  const cacheKey = `search:${query}:${maxResults}:${order}${pageToken ? `:${pageToken}` : ""}`;

  return swrFetch(
    cacheKey,
    async () => {
      let lastError: any = null;
      const maxRetries = Math.min(apiKeys.length, 3);

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const apiKey = getCurrentApiKey();
          const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              key: apiKey,
              q: query,
              part: "snippet",
              type: "video",
              maxResults: Math.min(maxResults, 50),
              pageToken: pageToken,
              order: order,
              regionCode: "JP",
            },
            timeout: 10000,
          });

          const items = (response.data.items || []).map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
          }));

          return {
            items,
            nextPageToken: response.data.nextPageToken,
            totalResults: response.data.pageInfo?.totalResults || 0,
          };
        } catch (error: any) {
          lastError = error;
          console.error(`[YouTubeAPI] Search error on attempt ${attempt + 1}:`, error.message);
          
          // Switch to next key on error
          switchToNextKey();
        }
      }

      throw lastError || new Error("Failed to search videos after multiple attempts");
    },
    {
      ttl: 600,
      staleTime: 300,
    }
  );
}

/**
 * Get video details from YouTube Data API V3
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  // Check cache first
  const cached = await getCachedVideo(videoId);
  if (cached && cached.cacheExpiredAt && new Date(cached.cacheExpiredAt) > new Date()) {
    return {
      id: cached.videoId,
      title: cached.title || "",
      description: cached.description || "",
      channelId: cached.channelId || "",
      channelTitle: cached.channelTitle || "",
      publishedAt: cached.publishedAt?.toISOString() || "",
      thumbnailUrl: cached.thumbnailUrl || "",
      viewCount: cached.viewCount,
      likeCount: cached.likeCount,
      commentCount: cached.commentCount,
      duration: cached.duration || "",
    };
  }

  let lastError: any = null;
  const maxRetries = Math.min(apiKeys.length, 3);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          key: apiKey,
          id: videoId,
          part: "snippet,statistics,contentDetails",
        },
        timeout: 10000,
      });

      const videoData = response.data.items?.[0];
      if (!videoData) {
        return null;
      }

      const video: YouTubeVideo = {
        id: videoData.id,
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        channelId: videoData.snippet.channelId,
        channelTitle: videoData.snippet.channelTitle,
        publishedAt: videoData.snippet.publishedAt,
        thumbnailUrl: videoData.snippet.thumbnails?.high?.url || videoData.snippet.thumbnails?.default?.url || "",
        viewCount: parseInt(videoData.statistics?.viewCount || "0"),
        likeCount: parseInt(videoData.statistics?.likeCount || "0"),
        commentCount: parseInt(videoData.statistics?.commentCount || "0"),
        duration: videoData.contentDetails?.duration || "",
      };

      // Cache the video
      await cacheVideo({
        videoId: video.id,
        title: video.title,
        description: video.description,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        publishedAt: new Date(video.publishedAt),
        thumbnailUrl: video.thumbnailUrl,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        duration: video.duration,
        cacheExpiredAt: new Date(Date.now() + CACHE_EXPIRY_MS),
      });

      return video;
    } catch (error: any) {
      lastError = error;
      console.error(`[YouTubeAPI] Get video details error on attempt ${attempt + 1}:`, error.message);
      switchToNextKey();
    }
  }

  throw lastError || new Error("Failed to get video details after multiple attempts");
}

/**
 * Get channel information from YouTube Data API V3
 */
export async function getChannelInfo(channelId: string): Promise<{
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
} | null> {
  let lastError: any = null;
  const maxRetries = Math.min(apiKeys.length, 3);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      const response = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
        params: {
          key: apiKey,
          id: channelId,
          part: "snippet,statistics",
        },
        timeout: 10000,
      });

      const channelData = response.data.items?.[0];
      if (!channelData) {
        return null;
      }

      return {
        id: channelData.id,
        title: channelData.snippet.title,
        description: channelData.snippet.description,
        thumbnailUrl: channelData.snippet.thumbnails?.default?.url || "",
        subscriberCount: parseInt(channelData.statistics?.subscriberCount || "0"),
        videoCount: parseInt(channelData.statistics?.videoCount || "0"),
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[YouTubeAPI] Get channel info error on attempt ${attempt + 1}:`, error.message);
      switchToNextKey();
    }
  }

  throw lastError || new Error("Failed to get channel info after multiple attempts");
}

/**
 * Get video comments from YouTube Data API V3
 */
export async function getVideoComments(
  videoId: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<{
  items: any[];
  nextPageToken?: string;
}> {
  let lastError: any = null;
  const maxRetries = Math.min(apiKeys.length, 3);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      const response = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", {
        params: {
          key: apiKey,
          videoId: videoId,
          part: "snippet",
          textFormat: "plainText",
          maxResults: Math.min(maxResults, 20),
          pageToken: pageToken,
        },
        timeout: 10000,
      });

      const items = (response.data.items || []).map((item: any) => ({
        id: item.id,
        videoId: videoId,
        authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        replyCount: item.snippet.replyCount,
      }));

      return {
        items,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[YouTubeAPI] Get comments error on attempt ${attempt + 1}:`, error.message);
      switchToNextKey();
    }
  }

  throw lastError || new Error("Failed to get comments after multiple attempts");
}

/**
 * Get related videos from YouTube Data API V3
 */
export async function getRelatedVideos(
  videoId: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<{
  items: SearchResult[];
  nextPageToken?: string;
}> {
  let lastError: any = null;
  const maxRetries = Math.min(apiKeys.length, 3);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: apiKey,
          relatedToVideoId: videoId,
          part: "snippet",
          type: "video",
          maxResults: Math.min(maxResults, 50),
          pageToken: pageToken,
        },
        timeout: 10000,
      });

      const items = (response.data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
      }));

      return {
        items,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[YouTubeAPI] Get related videos error on attempt ${attempt + 1}:`, error.message);
      switchToNextKey();
    }
  }

  throw lastError || new Error("Failed to get related videos after multiple attempts");
}

/**
 * Get channel videos from YouTube Data API V3
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 30,
  pageToken?: string
): Promise<{
  items: SearchResult[];
  nextPageToken?: string;
}> {
  let lastError: any = null;
  const maxRetries = Math.min(apiKeys.length, 3);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      
      // First, get the channel's uploads playlist ID
      const channelResponse = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
        params: {
          key: apiKey,
          id: channelId,
          part: "contentDetails",
        },
        timeout: 10000,
      });

      const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) {
        return { items: [], nextPageToken: undefined };
      }

      // Then get the videos from the uploads playlist
      const videosResponse = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
        params: {
          key: apiKey,
          playlistId: uploadsPlaylistId,
          part: "snippet",
          maxResults: Math.min(maxResults, 50),
          pageToken: pageToken,
        },
        timeout: 10000,
      });

      const items = (videosResponse.data.items || []).map((item: any) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
      }));

      return {
        items,
        nextPageToken: videosResponse.data.nextPageToken,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[YouTubeAPI] Get channel videos error on attempt ${attempt + 1}:`, error.message);
      switchToNextKey();
    }
  }

  throw lastError || new Error("Failed to get channel videos after multiple attempts");
}
