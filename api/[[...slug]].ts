import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async (req: VercelRequest, res: VercelResponse) => {
  // Don't handle /api/ paths - let them be handled by other API routes
  if (req.url?.startsWith("/api/")) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Try to serve static files first
  const filePath = path.join(process.cwd(), "dist/public", req.url === "/" ? "index.html" : req.url);
  
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const mimeTypes: { [key: string]: string } = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      res.send(content);
      return;
    }
  } catch (e) {
    // Continue to SPA fallback
  }

  // Fallback to index.html for SPA routing
  try {
    const indexPath = path.join(process.cwd(), "dist/public", "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(content);
  } catch (e) {
    res.status(404).send("Not found");
  }
};
