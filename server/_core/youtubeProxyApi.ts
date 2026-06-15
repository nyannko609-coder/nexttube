import axios from "axios";
import { ENV } from "./env";
import * as apiKeyManager from "../apiKeyManager";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * YouTube API V3 プロキシ API
 * 複数の API キーをローテーションして、クォータ無制限で YouTube API を使用
 */

export interface ProxyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usedApiKey?: number;
}

/**
 * YouTube API にリクエストを送信（自動キーローテーション）
 */
async function makeYouTubeRequest<T>(
  endpoint: string,
  params: Record<string, any>
): Promise<ProxyApiResponse<T>> {
  const maxRetries = 24; // 24 個のキーを試す
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const apiKeyData = await apiKeyManager.getAvailableApiKey();

      if (!apiKeyData) {
        return {
          success: false,
          error: "No available API keys",
        };
      }

      const response = await axios.get<T>(`${YOUTUBE_API_BASE_URL}/${endpoint}`, {
        params: {
          ...params,
          key: apiKeyData.key,
        },
      });

      // リクエスト成功
      await apiKeyManager.trackQuotaUsage(apiKeyData.keyNumber, 1);

      return {
        success: true,
        data: response.data,
        usedApiKey: apiKeyData.keyNumber,
      };
    } catch (error) {
      lastError = error as Error;
      const apiKeyData = await apiKeyManager.getAvailableApiKey();

      // エラーを記録して次のキーに切り替え
      const currentKeyData = await apiKeyManager.getAvailableApiKey();
      if (currentKeyData) {
        await apiKeyManager.recordApiError(currentKeyData.keyNumber, (error as Error).message);
      }

      // 次のキーを試す
      continue;
    }
  }

  return {
    success: false,
    error: lastError?.message || "All API keys failed",
  };
}

/**
 * 動画検索
 */
export async function searchVideos(
  query: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<ProxyApiResponse<any>> {
  return makeYouTubeRequest("search", {
    q: query,
    part: "snippet",
    type: "video",
    maxResults,
    pageToken,
    regionCode: "JP",
    relevanceLanguage: "ja",
  });
}

/**
 * 動画詳細取得
 */
export async function getVideoDetails(
  videoIds: string | string[]
): Promise<ProxyApiResponse<any>> {
  const ids = Array.isArray(videoIds) ? videoIds.join(",") : videoIds;

  return makeYouTubeRequest("videos", {
    id: ids,
    part: "snippet,contentDetails,statistics",
  });
}

/**
 * チャンネル情報取得
 */
export async function getChannelInfo(
  channelIds: string | string[]
): Promise<ProxyApiResponse<any>> {
  const ids = Array.isArray(channelIds) ? channelIds.join(",") : channelIds;

  return makeYouTubeRequest("channels", {
    id: ids,
    part: "snippet,statistics,contentDetails",
  });
}

/**
 * コメント取得
 */
export async function getComments(
  videoId: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<ProxyApiResponse<any>> {
  return makeYouTubeRequest("commentThreads", {
    videoId,
    part: "snippet,replies",
    maxResults,
    pageToken,
    textFormat: "plainText",
    order: "relevance",
  });
}

/**
 * プレイリスト内容取得
 */
export async function getPlaylistItems(
  playlistId: string,
  maxResults: number = 50,
  pageToken?: string
): Promise<ProxyApiResponse<any>> {
  return makeYouTubeRequest("playlistItems", {
    playlistId,
    part: "snippet,contentDetails",
    maxResults,
    pageToken,
  });
}

/**
 * チャンネルの動画取得
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50,
  pageToken?: string,
  order: string = "date"
): Promise<ProxyApiResponse<any>> {
  // チャンネルのアップロード プレイリストを取得
  const channelResponse = await getChannelInfo(channelId);

  if (!channelResponse.success || !channelResponse.data?.items?.[0]) {
    return {
      success: false,
      error: "Channel not found",
    };
  }

  const uploadsPlaylistId =
    channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    return {
      success: false,
      error: "Upload playlist not found",
    };
  }

  return getPlaylistItems(uploadsPlaylistId, maxResults, pageToken);
}

/**
 * 関連動画取得
 */
export async function getRelatedVideos(
  videoId: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<ProxyApiResponse<any>> {
  return makeYouTubeRequest("search", {
    relatedToVideoId: videoId,
    part: "snippet",
    type: "video",
    maxResults,
    pageToken,
  });
}
