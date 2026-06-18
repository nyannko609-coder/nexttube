import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import { initializeApiKeys } from "../../server/apiKeyManager";

// Initialize API keys on first request
let apiKeysInitialized = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  // Initialize API keys once
  if (!apiKeysInitialized) {
    try {
      await initializeApiKeys();
      apiKeysInitialized = true;
      console.log("[tRPC Handler] API keys initialized");
    } catch (error) {
      console.error("[tRPC Handler] Failed to initialize API keys:", error);
    }
  }

  // Handle tRPC request
  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: req as any,
      router: appRouter,
      createContext: async () => {
        return createContext({
          req: req as any,
          res: res as any,
        });
      },
    });

    res.setHeader("Content-Type", "application/json");
    res.status(response.status);
    res.send(await response.text());
  } catch (error) {
    console.error("[tRPC Handler] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
