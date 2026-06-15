import type { Express, Request, Response } from "express";
import * as youtubeProxyApi from "./youtubeProxyApi";
import { ENV } from "./env";

/**
 * YouTube API V3 プロキシ API ルート
 */

// API キー認証ミドルウェア
function authenticateApiKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers["x-api-key"] as string;

  // 簡易的な API キー検証（環境変数で定義）
  if (!apiKey || apiKey !== ENV.proxyApiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

export function registerYouTubeProxyRoutes(app: Express) {
  // 動画検索
  app.get("/api/v1/search", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const maxResults = parseInt(req.query.maxResults as string) || 20;
      const pageToken = req.query.pageToken as string;

      if (!query) {
        return res.status(400).json({ error: "q parameter is required" });
      }

      const result = await youtubeProxyApi.searchVideos(query, maxResults, pageToken);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // 動画詳細取得
  app.get("/api/v1/videos", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const videoIds = req.query.id as string;

      if (!videoIds) {
        return res.status(400).json({ error: "id parameter is required" });
      }

      const result = await youtubeProxyApi.getVideoDetails(videoIds);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Video details error:", error);
      res.status(500).json({ error: "Video details failed" });
    }
  });

  // チャンネル情報取得
  app.get("/api/v1/channels", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const channelIds = req.query.id as string;

      if (!channelIds) {
        return res.status(400).json({ error: "id parameter is required" });
      }

      const result = await youtubeProxyApi.getChannelInfo(channelIds);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Channel info error:", error);
      res.status(500).json({ error: "Channel info failed" });
    }
  });

  // コメント取得
  app.get("/api/v1/commentThreads", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const videoId = req.query.videoId as string;
      const maxResults = parseInt(req.query.maxResults as string) || 20;
      const pageToken = req.query.pageToken as string;

      if (!videoId) {
        return res.status(400).json({ error: "videoId parameter is required" });
      }

      const result = await youtubeProxyApi.getComments(videoId, maxResults, pageToken);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Comments error:", error);
      res.status(500).json({ error: "Comments failed" });
    }
  });

  // プレイリスト内容取得
  app.get("/api/v1/playlistItems", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const playlistId = req.query.playlistId as string;
      const maxResults = parseInt(req.query.maxResults as string) || 50;
      const pageToken = req.query.pageToken as string;

      if (!playlistId) {
        return res.status(400).json({ error: "playlistId parameter is required" });
      }

      const result = await youtubeProxyApi.getPlaylistItems(playlistId, maxResults, pageToken);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Playlist items error:", error);
      res.status(500).json({ error: "Playlist items failed" });
    }
  });

  // チャンネルの動画取得
  app.get("/api/v1/channelVideos", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const channelId = req.query.channelId as string;
      const maxResults = parseInt(req.query.maxResults as string) || 50;
      const pageToken = req.query.pageToken as string;
      const order = (req.query.order as string) || "date";

      if (!channelId) {
        return res.status(400).json({ error: "channelId parameter is required" });
      }

      const result = await youtubeProxyApi.getChannelVideos(
        channelId,
        maxResults,
        pageToken,
        order
      );
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Channel videos error:", error);
      res.status(500).json({ error: "Channel videos failed" });
    }
  });

  // 関連動画取得
  app.get("/api/v1/relatedVideos", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const videoId = req.query.videoId as string;
      const maxResults = parseInt(req.query.maxResults as string) || 20;
      const pageToken = req.query.pageToken as string;

      if (!videoId) {
        return res.status(400).json({ error: "videoId parameter is required" });
      }

      const result = await youtubeProxyApi.getRelatedVideos(videoId, maxResults, pageToken);
      res.json(result);
    } catch (error) {
      console.error("[ProxyAPI] Related videos error:", error);
      res.status(500).json({ error: "Related videos failed" });
    }
  });
}
