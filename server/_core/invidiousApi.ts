/**
 * Invidious API プロキシ
 * YouTube API に依存しない自作 API プロキシ
 * Invidious インスタンスから YouTube データを取得して、YouTube API V3 互換のレスポンスを返す
 */

import axios from 'axios';

// パブリック Invidious インスタンスのリスト
const INVIDIOUS_INSTANCES = [
  'https://invidious.jing.rocks',
  'https://invidious.nerdvpn.de',
  'https://invidious.slipfox.xyz',
  'https://invidious.protokolla.fi',
  'https://invidious.esmailelbob.xyz',
];

let currentInstanceIndex = 0;

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
  console.log(`[InvidiousAPI] Switched to instance: ${getAvailableInstance()}`);
}

/**
 * Invidious API を呼び出す（リトライ機能付き）
 */
async function callInvidiousApi<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < INVIDIOUS_INSTANCES.length; attempt++) {
    try {
      const instance = getAvailableInstance();
      const url = `${instance}/api/v1${endpoint}`;
      console.log(`[InvidiousAPI] Calling: ${url}`);

      const response = await axios.get<T>(url, {
        params,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `[InvidiousAPI] Error on instance ${getAvailableInstance()}: ${lastError.message}`
      );
      switchToNextInstance();
    }
  }

  throw new Error(
    `[InvidiousAPI] All instances failed. Last error: ${lastError?.message}`
  );
}

/**
 * 動画検索（YouTube API V3 互換）
 */
export async function searchVideos(
  query: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: { kind: string; videoId: string };
    snippet: {
      publishedAt: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
    };
  }>;
  nextPageToken?: string;
}> {
  const page = pageToken ? parseInt(pageToken) : 1;

  interface InvidiousSearchResult {
    videoId: string;
    title: string;
    description: string;
    descriptionHtml: string;
    viewCount: number;
    published: number;
    publishedText: string;
    lengthSeconds: number;
    author: string;
    authorId: string;
    authorUrl: string;
    authorThumbnail: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    isLiveContent: boolean;
  }

  const results = await callInvidiousApi<InvidiousSearchResult[]>(
    '/search',
    {
      q: query,
      page,
      type: 'video',
    }
  );

  return {
    items: results.map((video) => ({
      kind: 'youtube#searchResult',
      etag: `"${video.videoId}"`,
      id: {
        kind: 'youtube#video',
        videoId: video.videoId,
      },
      snippet: {
        publishedAt: new Date(video.published * 1000).toISOString(),
        title: video.title,
        description: video.description,
        thumbnails: {
          default: {
            url: video.videoThumbnails.find((t) => t.quality === 'default')
              ?.url || '',
            width: 120,
            height: 90,
          },
          medium: {
            url: video.videoThumbnails.find((t) => t.quality === 'medium')
              ?.url || '',
            width: 320,
            height: 180,
          },
          high: {
            url: video.videoThumbnails.find((t) => t.quality === 'high')?.url ||
              '',
            width: 480,
            height: 360,
          },
        },
        channelTitle: video.author,
        liveBroadcastContent: video.isLiveContent
          ? 'live'
          : 'none',
      },
    })),
    nextPageToken: (page + 1).toString(),
  };
}

/**
 * 動画詳細取得（YouTube API V3 互換）
 */
export async function getVideoDetails(videoId: string): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelId: string;
      channelTitle: string;
      tags: string[];
      categoryId: string;
      liveBroadcastContent: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }>;
}> {
  interface InvidiousVideoDetail {
    videoId: string;
    title: string;
    description: string;
    descriptionHtml: string;
    viewCount: number;
    published: number;
    publishedText: string;
    lengthSeconds: number;
    author: string;
    authorId: string;
    authorUrl: string;
    authorThumbnail: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    isLiveContent: boolean;
    likeCount: number;
    commentCount: number;
  }

  const video = await callInvidiousApi<InvidiousVideoDetail>(
    `/videos/${videoId}`
  );

  return {
    items: [
      {
        kind: 'youtube#video',
        etag: `"${video.videoId}"`,
        id: video.videoId,
        snippet: {
          publishedAt: new Date(video.published * 1000).toISOString(),
          title: video.title,
          description: video.description,
          thumbnails: {
            default: {
              url: video.videoThumbnails.find((t) => t.quality === 'default')
                ?.url || '',
              width: 120,
              height: 90,
            },
            medium: {
              url: video.videoThumbnails.find((t) => t.quality === 'medium')
                ?.url || '',
              width: 320,
              height: 180,
            },
            high: {
              url: video.videoThumbnails.find((t) => t.quality === 'high')
                ?.url || '',
              width: 480,
              height: 360,
            },
          },
          channelId: video.authorId,
          channelTitle: video.author,
          tags: [],
          categoryId: '0',
          liveBroadcastContent: video.isLiveContent ? 'live' : 'none',
        },
        statistics: {
          viewCount: video.viewCount.toString(),
          likeCount: video.likeCount.toString(),
          commentCount: video.commentCount.toString(),
        },
      },
    ],
  };
}

/**
 * チャンネル情報取得（YouTube API V3 互換）
 */
export async function getChannelInfo(channelId: string): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
    };
    statistics: {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
    };
  }>;
}> {
  interface InvidiousChannelDetail {
    author: string;
    authorId: string;
    authorUrl: string;
    authorBanners: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    authorThumbnails: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    description: string;
    descriptionHtml: string;
    viewCount: number;
    subscriberCount: number;
    videoCount: number;
  }

  const channel = await callInvidiousApi<InvidiousChannelDetail>(
    `/channels/${channelId}`
  );

  return {
    items: [
      {
        kind: 'youtube#channel',
        etag: `"${channel.authorId}"`,
        id: channel.authorId,
        snippet: {
          title: channel.author,
          description: channel.description,
          customUrl: channel.authorUrl,
          publishedAt: new Date().toISOString(),
          thumbnails: {
            default: {
              url: channel.authorThumbnails[0]?.url || '',
              width: 88,
              height: 88,
            },
            medium: {
              url: channel.authorThumbnails[1]?.url || '',
              width: 240,
              height: 240,
            },
            high: {
              url: channel.authorThumbnails[2]?.url || '',
              width: 800,
              height: 800,
            },
          },
        },
        statistics: {
          viewCount: channel.viewCount.toString(),
          subscriberCount: channel.subscriberCount.toString(),
          videoCount: channel.videoCount.toString(),
        },
      },
    ],
  };
}

/**
 * 関連動画取得（YouTube API V3 互換）
 */
export async function getRelatedVideos(videoId: string): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: { kind: string; videoId: string };
    snippet: {
      publishedAt: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
    };
  }>;
}> {
  const video = await getVideoDetails(videoId);

  // Invidious は関連動画を直接提供しないため、
  // 同じチャンネルの他の動画を返す
  if (video.items.length === 0) {
    return { items: [] };
  }

  const channelId = video.items[0].snippet.channelId;

  interface InvidiousChannelVideos {
    videoId: string;
    title: string;
    description: string;
    descriptionHtml: string;
    viewCount: number;
    published: number;
    publishedText: string;
    lengthSeconds: number;
    author: string;
    authorId: string;
    authorUrl: string;
    authorThumbnail: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    isLiveContent: boolean;
  }

  const relatedVideos = await callInvidiousApi<InvidiousChannelVideos[]>(
    `/channels/${channelId}/latest_videos`
  );

  return {
    items: relatedVideos
      .filter((v) => v.videoId !== videoId)
      .slice(0, 20)
      .map((v) => ({
        kind: 'youtube#searchResult',
        etag: `"${v.videoId}"`,
        id: {
          kind: 'youtube#video',
          videoId: v.videoId,
        },
        snippet: {
          publishedAt: new Date(v.published * 1000).toISOString(),
          title: v.title,
          description: v.description,
          thumbnails: {
            default: {
              url: v.videoThumbnails.find((t) => t.quality === 'default')
                ?.url || '',
              width: 120,
              height: 90,
            },
            medium: {
              url: v.videoThumbnails.find((t) => t.quality === 'medium')
                ?.url || '',
              width: 320,
              height: 180,
            },
            high: {
              url: v.videoThumbnails.find((t) => t.quality === 'high')?.url ||
                '',
              width: 480,
              height: 360,
            },
          },
          channelTitle: v.author,
          liveBroadcastContent: v.isLiveContent ? 'live' : 'none',
        },
      })),
  };
}

/**
 * コメント取得（YouTube API V3 互換）
 */
export async function getVideoComments(
  videoId: string,
  pageToken?: string
): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      videoId: string;
      textDisplay: string;
      textOriginal: string;
      authorDisplayName: string;
      authorProfileImageUrl: string;
      authorChannelUrl: string;
      authorChannelId: { value: string };
      canReply: boolean;
      canDelete: boolean;
      canLike: boolean;
      canUpdate: boolean;
      likeCount: number;
      publishedAt: string;
      updatedAt: string;
    };
  }>;
  nextPageToken?: string;
}> {
  interface InvidiousComment {
    content: string;
    contentHtml: string;
    author: string;
    authorThumbnail: string;
    authorId: string;
    authorUrl: string;
    isEdited: boolean;
    likeCount: number;
    published: number;
    publishedText: string;
    replies?: {
      replyCount: number;
      continuation: string;
    };
  }

  const page = pageToken ? parseInt(pageToken) : 0;

  const comments = await callInvidiousApi<InvidiousComment[]>(
    `/comments/${videoId}`,
    { page }
  );

  return {
    items: comments.map((comment, index) => ({
      kind: 'youtube#comment',
      etag: `"${videoId}-${page}-${index}"`,
      id: `${videoId}-${page}-${index}`,
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
        likeCount: comment.likeCount,
        publishedAt: new Date(comment.published * 1000).toISOString(),
        updatedAt: new Date(comment.published * 1000).toISOString(),
      },
    })),
    nextPageToken: (page + 1).toString(),
  };
}

/**
 * チャンネル動画取得（YouTube API V3 互換）
 */
export async function getChannelVideos(
  channelId: string,
  pageToken?: string
): Promise<{
  items: Array<{
    kind: string;
    etag: string;
    id: { kind: string; videoId: string };
    snippet: {
      publishedAt: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
    };
  }>;
  nextPageToken?: string;
}> {
  interface InvidiousChannelVideos {
    videoId: string;
    title: string;
    description: string;
    descriptionHtml: string;
    viewCount: number;
    published: number;
    publishedText: string;
    lengthSeconds: number;
    author: string;
    authorId: string;
    authorUrl: string;
    authorThumbnail: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    isLiveContent: boolean;
  }

  const page = pageToken ? parseInt(pageToken) : 1;

  const videos = await callInvidiousApi<InvidiousChannelVideos[]>(
    `/channels/${channelId}/videos`,
    { page }
  );

  return {
    items: videos.map((video) => ({
      kind: 'youtube#searchResult',
      etag: `"${video.videoId}"`,
      id: {
        kind: 'youtube#video',
        videoId: video.videoId,
      },
      snippet: {
        publishedAt: new Date(video.published * 1000).toISOString(),
        title: video.title,
        description: video.description,
        thumbnails: {
          default: {
            url: video.videoThumbnails.find((t) => t.quality === 'default')
              ?.url || '',
            width: 120,
            height: 90,
          },
          medium: {
            url: video.videoThumbnails.find((t) => t.quality === 'medium')
              ?.url || '',
            width: 320,
            height: 180,
          },
          high: {
            url: video.videoThumbnails.find((t) => t.quality === 'high')?.url ||
              '',
            width: 480,
            height: 360,
          },
        },
        channelTitle: video.author,
        liveBroadcastContent: video.isLiveContent ? 'live' : 'none',
      },
    })),
    nextPageToken: (page + 1).toString(),
  };
}
