import { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// Proxy configuration
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

export async function downloadVideoYtdlp(req: Request, res: Response) {
  try {
    const { videoId } = req.query;

    if (!videoId || typeof videoId !== "string") {
      return res.status(400).json({ error: "videoId required" });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[Download-ytdlp] Starting download for video: ${videoId}`);

    try {
      // 一時ディレクトリを作成
      const tempDir = path.join("/tmp", `youtube-download-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      // yt-dlpコマンドを構築（絶対パスでPython3.11を指定）
      const outputTemplate = path.join(tempDir, "%(title)s.%(ext)s");
      let command = `/usr/bin/python3.11 /usr/local/bin/yt-dlp -f "best[ext=mp4]/best" -o "${outputTemplate}" "${url}"`;

      // プロキシを使用
      if (PROXY_URL) {
        command += ` --proxy "${PROXY_URL}"`;
        console.log(`[Download-ytdlp] Using proxy: ${PROXY_URL.split('@')[1] || PROXY_URL}`);
      }

      // クッキーを使用（オプション）
      const cookies = req.headers.cookie;
      if (cookies) {
        const cookieFile = path.join(tempDir, "cookies.txt");
        // Netscape cookie形式に変換（簡易版）
        fs.writeFileSync(cookieFile, cookies);
        command += ` --cookies "${cookieFile}"`;
      }

      console.log(`[Download-ytdlp] Executing: ${command.replace(PROXY_URL || '', '[PROXY]')}`);

      // yt-dlpを実行
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 100, // 100MB
        timeout: 300000, // 5分
      });

      console.log(`[Download-ytdlp] stdout: ${stdout}`);
      if (stderr) {
        console.log(`[Download-ytdlp] stderr: ${stderr}`);
      }

      // ダウンロードされたファイルを探す
      const files = fs.readdirSync(tempDir).filter(f => f !== "cookies.txt");
      if (files.length === 0) {
        throw new Error("No file downloaded");
      }

      const downloadedFile = path.join(tempDir, files[0]);
      const stat = fs.statSync(downloadedFile);
      
      console.log(`[Download-ytdlp] File downloaded: ${files[0]} (${stat.size} bytes)`);

      // ファイルをストリーミング
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(files[0])}"`);
      res.setHeader("Content-Length", stat.size);

      const fileStream = fs.createReadStream(downloadedFile);
      fileStream.pipe(res);

      fileStream.on("end", () => {
        // クリーンアップ
        console.log(`[Download-ytdlp] Cleaning up temp directory: ${tempDir}`);
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      fileStream.on("error", (err) => {
        console.error(`[Download-ytdlp] Stream error:`, err);
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

    } catch (error: any) {
      console.error(`[Download-ytdlp] Error:`, error.message);
      return res.status(500).json({ error: error.message || "Download failed" });
    }
  } catch (error: any) {
    console.error(`[Download-ytdlp] Unexpected error:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
