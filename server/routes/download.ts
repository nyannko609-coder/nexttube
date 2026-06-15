import { Request, Response } from "express";
import ytdl from "@distube/ytdl-core";
import { HttpsProxyAgent } from "https-proxy-agent";

// Proxy configuration
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

export async function downloadVideo(req: Request, res: Response) {
  try {
    const { videoId } = req.query;

    if (!videoId || typeof videoId !== "string") {
      return res.status(400).json({ error: "videoId required" });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`[Download] Starting download for video: ${videoId}`);

    try {
      // ブラウザのクッキーを取得
      const cookies = req.headers.cookie || '';
      console.log(`[Download] Cookies: ${cookies ? 'yes' : 'no'}`);

      // ytdl-coreのオプション設定
      const options: any = {
        // ブラウザのUser-Agentを使用
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Cookie': cookies,
          },
        },
      };

      // Add proxy for miniget (used by ytdl-core internally)
      if (PROXY_URL) {
        console.log(`[Download] Using proxy: ${PROXY_URL.split('@')[1] || PROXY_URL}`);
        // Set proxy via environment variable for miniget
        process.env.HTTP_PROXY = PROXY_URL;
        process.env.HTTPS_PROXY = PROXY_URL;
      }

      // 動画情報を取得
      console.log(`[Download] Getting video info...`);
      const info = await ytdl.getInfo(url, options);
      
      const videoTitle = info.videoDetails.title;
      console.log(`[Download] Video title: ${videoTitle}`);

      // 最高品質のフォーマットを取得
      const formats = info.formats.filter((f: any) => f.container === "mp4");
      let format = formats.find((f: any) => f.hasAudio && f.hasVideo);
      
      if (!format) {
        // オーディオとビデオが別の場合
        const videoFormat = formats.find((f: any) => f.hasVideo && !f.hasAudio);
        if (videoFormat) {
          format = videoFormat;
        }
      }

      if (!format) {
        // MP4がない場合は他のコンテナを試す
        format = info.formats.find((f: any) => f.hasAudio && f.hasVideo);
      }

      if (!format) {
        console.error(`[Download] No suitable format found`);
        return res.status(500).json({ error: "No suitable format found" });
      }

      console.log(`[Download] Selected format: ${format.itag} (${format.mimeType})`);

      // ダウンロードストリームを取得
      const stream = ytdl(url, { ...options, format });

      // レスポンスヘッダーを設定
      res.setHeader("Content-Disposition", `attachment; filename="${videoTitle}.mp4"`);
      res.setHeader("Content-Type", "video/mp4");

      // ストリームをパイプ
      stream.pipe(res);

      // エラーハンドリング
      stream.on("error", (err) => {
        console.error(`[Download] Stream error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream failed" });
        }
      });

      res.on("error", (err) => {
        console.error(`[Download] Response error: ${err.message}`);
        stream.destroy();
      });

    } catch (err) {
      console.error(`[Download] Error: ${err instanceof Error ? err.message : String(err)}`);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Download failed",
          details: err instanceof Error ? err.message : String(err),
        });
      }
    }

  } catch (err) {
    console.error(`[Download] Error: ${err instanceof Error ? err.message : String(err)}`);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed",
      });
    }
  }
}
