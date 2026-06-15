import axios from "axios";
import { cacheVideo, getCachedVideo } from "./videoDb";
import { swrFetch } from "./swrCache";

/**
 * YouTube Data API Integration (Using Invidious API)
 * All requests go through Invidious instances with automatic failover
 */

// Invidious API インスタンスのリスト（公式ドキュメントから）
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://inv.thepixora.com',
  'https://invidious.tiekoetter.com',
  'https://yt.chocolatemoo53.com',
  'https://invidious.f5.si',
  'https://invidious.nerdvpn.de',
];

let currentInstanceIndex = 0;
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
 * 利用可能な Invidious インスタンスを取得
 */
function getAvailableInstance(): string {
  return INVIDIOUS_INSTANCES[currentInstanceIndex % INVIDIOUS_INSTANCES.length];
}

/**
 * 次の Invidious インスタンスに切り替え
 */
function switchToNextInstance(): void {
  currentInstanceIndex++;
  console.log(`[YouTubeAPI] Switched to Invidious instance: ${getAvailableInstance()}`);
}

/**
 * Search for videos on YouTube (with SWR caching)
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
      try {
        const instance = getAvailableInstance();
        const response = await axios.get(`${instance}/api/v1/search`, {
          params: {
            q: query,
            page: pageToken ? parseInt(pageToken) : 1,
            type: 'video',
          },
          timeout: 10000,
        });

        const result = Array.isArray(response.data) ? response.data : response.data.items || [];

        const items = result.map((item: any) => {
          let thumbnailUrl = "";
          const thumbnails = item.videoThumbnails || [];
          
          if (thumbnailQuality === "ultra" || thumbnailQuality === "maxhigh") {
            thumbnailUrl = thumbnails.find((t: any) => t.quality === 'maxres')?.url ||
                          thumbnails.find((t: any) => t.quality === 'high')?.url ||
                          thumbnails.find((t: any) => t.quality === 'medium')?.url ||
                          thumbnails[0]?.url || "";
          } else if (thumbnailQuality === "high") {
            thumbnailUrl = thumbnails.find((t: any) => t.quality === 'high')?.url ||
                          thumbnails.find((t: any) => t.quality === 'medium')?.url ||
                          thumbnails[0]?.url || "";
          } else if (thumbnailQuality === "medium") {
            thumbnailUrl = thumbnails.find((t: any) => t.quality === 'medium')?.url ||
                          thumbnails[0]?.url || "";
          } else {
            thumbnailUrl = thumbnails[0]?.url || "";
          }

          return {
            videoId: item.videoId,
            title: item.title,
            description: item.description,
            channelId: item.authorId,
            channelTitle: item.author,
            publishedAt: new Date(item.published * 1000).toISOString(),
            thumbnailUrl,
          };
        });

        return {
          items,
          nextPageToken: pageToken ? (parseInt(pageToken) + 1).toString() : '2',
          totalResults: items.length,
        };
      } catch (error: any) {
        console.error("[YouTubeAPI] Search error:", error.message);
        switchToNextInstance();
        // Retry with next instance
        if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
          return searchVideos(query, maxResults, pageToken, order, thumbnailQuality);
        }
        throw error;
      }
    },
    {
      ttl: 600,
      staleTime: 300,
    }
  );
}

/**
 * Get video details
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

  try {
    const instance = getAvailableInstance();
    const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, {
      timeout: 10000,
    });

    const videoData = response.data;

    if (!videoData) {
      return null;
    }

    let channelThumbnailUrl: string | undefined;
    try {
      const channelInfo = await getChannelInfo(videoData.authorId);
      channelThumbnailUrl = channelInfo?.thumbnailUrl || videoData.authorThumbnails?.[0]?.url;
    } catch (error) {
      console.warn("[YouTubeAPI] Failed to get channel info for thumbnail");
      channelThumbnailUrl = videoData.authorThumbnails?.[0]?.url;
    }

    const video: YouTubeVideo = {
      id: videoData.videoId,
      title: videoData.title,
      description: videoData.description,
      channelId: videoData.authorId,
      channelTitle: videoData.author,
      publishedAt: new Date(videoData.published * 1000).toISOString(),
      thumbnailUrl: videoData.videoThumbnails?.find((t: any) => t.quality === 'high')?.url || videoData.videoThumbnails?.[0]?.url || '',
      channelThumbnailUrl,
      viewCount: videoData.viewCount || 0,
      likeCount: videoData.likeCount || 0,
      commentCount: videoData.commentCount || 0,
      duration: videoData.lengthSeconds ? `PT${videoData.lengthSeconds}S` : '',
    };

    // Cache the video
    await cacheVideo({
      videoId: video.id,
      title: video.title,
      description: video.description,
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      publishedAt: new Date(videoData.published * 1000),
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      duration: video.duration,
      cacheExpiredAt: new Date(Date.now() + CACHE_EXPIRY_MS),
    });

    return video;
  } catch (error: any) {
    console.error("[YouTubeAPI] Get video details error:", error.message);
    switchToNextInstance();
    if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
      return getVideoDetails(videoId);
    }
    throw error;
  }
}

/**
 * Get channel info
 */
export async function getChannelInfo(channelId: string) {
  try {
    const instance = getAvailableInstance();
    const response = await axios.get(`${instance}/api/v1/channels/${channelId}`, {
      timeout: 10000,
    });

    const channelData = response.data;

    if (!channelData) {
      return null;
    }

    return {
      id: channelData.authorId,
      title: channelData.author,
      description: channelData.description,
      thumbnailUrl: channelData.authorThumbnails?.[0]?.url || '',
      subscriberCount: channelData.subscriberCount,
      viewCount: channelData.viewCount,
      videoCount: channelData.videoCount,
    };
  } catch (error: any) {
    console.error("[YouTubeAPI] Get channel info error:", error.message);
    switchToNextInstance();
    if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
      return getChannelInfo(channelId);
    }
    throw error;
  }
}

/**
 * Get video comments
 */
export async function getVideoComments(videoId: string, maxResults: number = 20, pageToken?: string) {
  try {
    const instance = getAvailableInstance();
    const response = await axios.get(`${instance}/api/v1/comments/${videoId}`, {
      params: {
        page: pageToken ? parseInt(pageToken) : 0,
      },
      timeout: 10000,
    });

    const result = Array.isArray(response.data) ? response.data : response.data.items || [];

    return {
      items: result.map((comment: any) => ({
        kind: 'youtube#comment',
        etag: `"${comment.author}"`,
        id: `${videoId}-${comment.author}`,
        snippet: {
          videoId,
          textDisplay: comment.content,
          textOriginal: comment.content,
          authorDisplayName: comment.author,
          authorProfileImageUrl: comment.authorThumbnail,
          authorChannelUrl: comment.authorUrl,
          authorChannelId: { value: comment.authorId },
          canReply: false,
          canDelete: false,
          canLike: true,
          canUpdate: false,
          likeCount: comment.likeCount || 0,
          publishedAt: new Date(comment.published * 1000).toISOString(),
          updatedAt: new Date(comment.published * 1000).toISOString(),
        },
      })),
      nextPageToken: pageToken ? (parseInt(pageToken) + 1).toString() : '1',
    };
  } catch (error: any) {
    console.error("[YouTubeAPI] Get comments error:", error.message);
    switchToNextInstance();
    if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
      return getVideoComments(videoId, maxResults, pageToken);
    }
    throw error;
  }
}

/**
 * Get related videos
 */
export async function getRelatedVideos(videoId: string, maxResults: number = 20): Promise<SearchResult[]> {
  try {
    const instance = getAvailableInstance();
    const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, {
      timeout: 10000,
    });

    // Get channel videos as related videos
    const channelVideos = await getChannelVideos(response.data.authorId, maxResults);
    return channelVideos.items.filter((item: any) => item.videoId !== videoId);
  } catch (error: any) {
    console.error("[YouTubeAPI] Get related videos error:", error.message);
    switchToNextInstance();
    if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
      return getRelatedVideos(videoId, maxResults);
    }
    throw error;
  }
}

/**
 * Get channel videos
 */
export async function getChannelVideos(channelId: string, maxResults: number = 20, pageToken?: string): Promise<{
  items: SearchResult[];
  nextPageToken?: string;
}> {
  try {
    const instance = getAvailableInstance();
    const response = await axios.get(`${instance}/api/v1/channels/${channelId}/videos`, {
      params: {
        page: pageToken ? parseInt(pageToken) : 1,
      },
      timeout: 10000,
    });

    const result = Array.isArray(response.data) ? response.data : response.data.items || [];

    return {
      items: result.map((item: any) => ({
        videoId: item.videoId,
        title: item.title,
        description: item.description,
        channelId: item.authorId,
        channelTitle: item.author,
        publishedAt: new Date(item.published * 1000).toISOString(),
        thumbnailUrl: item.videoThumbnails?.find((t: any) => t.quality === 'high')?.url || item.videoThumbnails?.[0]?.url || '',
      })),
      nextPageToken: pageToken ? (parseInt(pageToken) + 1).toString() : '2',
    };
  } catch (error: any) {
    console.error("[YouTubeAPI] Get channel videos error:", error.message);
    switchToNextInstance();
    if (currentInstanceIndex % INVIDIOUS_INSTANCES.length !== 0) {
      return getChannelVideos(channelId, maxResults, pageToken);
    }
    throw error;
  }
}
