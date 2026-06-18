console.log('[ENV] Loading environment variables...');

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  ownerName: process.env.OWNER_NAME ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  swrEnabled: process.env.SWR_ENABLED !== 'false',
  frontendUrl: process.env.VITE_FRONTEND_URL ?? `http://localhost:5173`,
  youtubeApiKey1: process.env.YOUTUBE_API_KEY_1 ?? "",
  // Debug: Log if YouTube API keys are present
  _debug_youtubeKeys: (() => {
    const keys = [];
    for (let i = 1; i <= 24; i++) {
      const key = (process.env as any)[`YOUTUBE_API_KEY_${i}`];
      if (key) keys.push(i);
    }
    console.log(`[ENV] Found YouTube API keys for indices: ${keys.join(', ')}`);
    return keys.length;
  })(),
  youtubeApiKey2: process.env.YOUTUBE_API_KEY_2 ?? "",
  youtubeApiKey3: process.env.YOUTUBE_API_KEY_3 ?? "",
  youtubeApiKey4: process.env.YOUTUBE_API_KEY_4 ?? "",
  youtubeApiKey5: process.env.YOUTUBE_API_KEY_5 ?? "",
  youtubeApiKey6: process.env.YOUTUBE_API_KEY_6 ?? "",
  youtubeApiKey7: process.env.YOUTUBE_API_KEY_7 ?? "",
  youtubeApiKey8: process.env.YOUTUBE_API_KEY_8 ?? "",
  youtubeApiKey9: process.env.YOUTUBE_API_KEY_9 ?? "",
  youtubeApiKey10: process.env.YOUTUBE_API_KEY_10 ?? "",
  youtubeApiKey11: process.env.YOUTUBE_API_KEY_11 ?? "",
  youtubeApiKey12: process.env.YOUTUBE_API_KEY_12 ?? "",
  youtubeApiKey13: process.env.YOUTUBE_API_KEY_13 ?? "",
  youtubeApiKey14: process.env.YOUTUBE_API_KEY_14 ?? "",
  youtubeApiKey15: process.env.YOUTUBE_API_KEY_15 ?? "",
  youtubeApiKey16: process.env.YOUTUBE_API_KEY_16 ?? "",
  youtubeApiKey17: process.env.YOUTUBE_API_KEY_17 ?? "",
  youtubeApiKey18: process.env.YOUTUBE_API_KEY_18 ?? "",
  youtubeApiKey19: process.env.YOUTUBE_API_KEY_19 ?? "",
  youtubeApiKey20: process.env.YOUTUBE_API_KEY_20 ?? "",
  youtubeApiKey21: process.env.YOUTUBE_API_KEY_21 ?? "",
  youtubeApiKey22: process.env.YOUTUBE_API_KEY_22 ?? "",
  youtubeApiKey23: process.env.YOUTUBE_API_KEY_23 ?? "",
  youtubeApiKey24: process.env.YOUTUBE_API_KEY_24 ?? "",
  youtubeApiKey25: process.env.YOUTUBE_API_KEY_25 ?? "",
  googleOAuthClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleOAuthClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  proxyApiKey: process.env.PROXY_API_KEY ?? "nexttube-proxy-api-key",
};
