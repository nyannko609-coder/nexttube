import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const YOUTUBE_API_KEYS = [
  process.env.YOUTUBE_API_KEY_1,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
  process.env.YOUTUBE_API_KEY_4,
  process.env.YOUTUBE_API_KEY_5,
  process.env.YOUTUBE_API_KEY_6,
  process.env.YOUTUBE_API_KEY_7,
  process.env.YOUTUBE_API_KEY_8,
  process.env.YOUTUBE_API_KEY_9,
  process.env.YOUTUBE_API_KEY_10,
  process.env.YOUTUBE_API_KEY_11,
  process.env.YOUTUBE_API_KEY_12,
  process.env.YOUTUBE_API_KEY_13,
  process.env.YOUTUBE_API_KEY_14,
  process.env.YOUTUBE_API_KEY_15,
  process.env.YOUTUBE_API_KEY_16,
  process.env.YOUTUBE_API_KEY_17,
  process.env.YOUTUBE_API_KEY_18,
  process.env.YOUTUBE_API_KEY_19,
  process.env.YOUTUBE_API_KEY_20,
  process.env.YOUTUBE_API_KEY_21,
  process.env.YOUTUBE_API_KEY_22,
  process.env.YOUTUBE_API_KEY_23,
  process.env.YOUTUBE_API_KEY_24,
].filter(Boolean);

let currentKeyIndex = 0;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { q, maxResults = 20 } = req.query;

  if (!q) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  try {
    const apiKey = YOUTUBE_API_KEYS[currentKeyIndex % YOUTUBE_API_KEYS.length];

    if (!apiKey) {
      res.status(500).json({ error: "No API keys available" });
      return;
    }

    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: q,
        maxResults: maxResults,
        type: "video",
        key: apiKey,
      },
    });

    // Rotate API key for next request
    currentKeyIndex++;

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("[Search API] Error:", error.message);

    // Try next API key on error
    currentKeyIndex++;

    res.status(500).json({
      error: "Failed to search videos",
      message: error.message,
    });
  }
};
