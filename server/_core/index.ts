import "dotenv/config";
import express from "express";
import compression from "compression";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerYouTubeProxyRoutes } from "./youtubeProxyRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeApiKeys } from "../apiKeyManager";
import { startQuotaResetScheduler } from "../quotaResetScheduler";
import { downloadVideo } from "../routes/download";
import { downloadVideoYtdlp } from "../routes/download-ytdlp";
import { handleStripeWebhook } from "./stripeWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize API keys on server startup
  try {
    await initializeApiKeys();
    // Start quota reset scheduler (resets at 17:00 JST)
    startQuotaResetScheduler();
  } catch (error) {
    console.error("Failed to initialize API keys:", error);
  }

  const app = express();
  const server = createServer(app);
  
  // Stripe webhook must be registered BEFORE express.json() to access raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Enable gzip compression for all responses
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers['cache-control']?.includes('no-transform')) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  // Configure body parser with larger size limit for file uploads
  // Note: Stripe webhook is handled before this middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // YouTube API V3 Proxy routes
  registerYouTubeProxyRoutes(app);
  // Download endpoint (yt-dlp)
  app.get("/api/download", downloadVideoYtdlp);
  // tRPC API with compression
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(`tRPC error at path: ${path}`, error);
      }
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
