import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { Express, Request, Response } from "express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { VercelRequest, VercelResponse } from "@vercel/node";

// Create Express app for this serverless function
const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC error at path: ${path}`, error);
    },
  })
);

// Export as Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Remove /api prefix since Vercel already routes to /api
  req.url = req.url.replace(/^\/api/, "");
  
  // Handle the request through Express
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
};
