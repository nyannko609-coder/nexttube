import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { ArrowLeft, Moon, Sun, Share2, Copy, Globe, Sliders } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

export function SettingsSite() {
  const { language: contextLanguage, setLanguage: setContextLanguage } = useLanguage();
  const { theme: contextTheme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [displayLanguage, setDisplayLanguage] = useState<'ja' | 'en'>('en');
  const [displayTheme, setDisplayTheme] = useState<'dark' | 'light'>('light');
  const [shareButtonMode, setShareButtonMode] = useState<"clipboard" | "dialog">("clipboard");
  const [imageThumbnailWidth, setImageThumbnailWidth] = useState<string>("w-36");
  const [thumbnailQuality, setThumbnailQuality] = useState<"default" | "medium" | "high" | "maxhigh" | "ultra">("high");
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const hasAppliedTheme = useRef(false);

  // Fetch user settings from database
  const { data: dbSettings, isLoading: isLoadingSettings, error: settingsError } = trpc.settings.get.useQuery();

  // Initialize display language and theme from database
  useEffect(() => {
    if (dbSettings && !hasAppliedTheme.current) {
      const dbTheme = (dbSettings.theme as 'dark' | 'light') || 'light';
      setDisplayLanguage((dbSettings.language as 'ja' | 'en') || 'en');
      setDisplayTheme(dbTheme);
      
      // Sync database theme with ThemeContext only once
      if (contextTheme !== dbTheme && toggleTheme) {
        toggleTheme();
        hasAppliedTheme.current = true;
      }
    }
  }, [dbSettings]);
  const updateSettingsMutation = trpc.settings.update.useMutation();



  const t = {
    ja: {
      backToSettings: "戻る",
      siteSettings: "サイト仕様",
      darkMode: "ダークモード",
      darkModeDesc: "ダークモードを有効にする",
      shareButton: "共有ボタン仕様",
      shareButtonClipboard: "クリップボードにコピー",
      shareButtonDialog: "共有ダイアログを表示",
      language: "言語",
      languageDesc: "表示言語を選択",
      japanese: "日本語",
      english: "English",
      imageThumbnail: "関連動画の画像サイズ",
      imageThumbnailDesc: "関連動画のサムネイル幅を調整",
      thumbnailQuality: "サムネイル画質",
      thumbnailQualityDesc: "検索結果と関連動画のサムネイル画質を選択",
      qualityDefault: "低画質 (120x90)",
      qualityMedium: "中画質 (320x180)",
      qualityHigh: "高画質 (480x360)",
      qualityMaxHigh: "超高画質 (1280x720) 推奨",
      qualityUltra: "最高画質 (1920x1080)",
    },
    en: {
      backToSettings: "Back",
      siteSettings: "Site Settings",
      darkMode: "Dark Mode",
      darkModeDesc: "Enable dark mode",
      shareButton: "Share Button Behavior",
      shareButtonClipboard: "Copy to clipboard",
      shareButtonDialog: "Show share dialog",
      language: "Language",
      languageDesc: "Select display language",
      japanese: "日本語",
      english: "English",
      imageThumbnail: "Related Video Thumbnail Size",
      imageThumbnailDesc: "Adjust the thumbnail width of related videos",
      thumbnailQuality: "Thumbnail Quality",
      thumbnailQualityDesc: "Select thumbnail quality for search results and related videos",
      qualityDefault: "Low (120x90)",
      qualityMedium: "Medium (320x180)",
      qualityHigh: "High (480x360)",
      qualityMaxHigh: "Max High (1280x720) Recommended",
      qualityUltra: "Ultra (1920x1080)",
    },
  };

  const currentT = t[displayLanguage as keyof typeof t] || t.ja;

  // Load settings from database when available
  useEffect(() => {
    if (dbSettings) {
      // Map database quality values to UI values
      const qualityMap: Record<string, "default" | "medium" | "high" | "maxhigh" | "ultra"> = {
        'low': 'default',
        'medium': 'medium',
        'high': 'high',
        'ultra': 'maxhigh',
        'maximum': 'ultra',
      };
      const mappedQuality = qualityMap[dbSettings.thumbnailQuality] || 'high';
      setThumbnailQuality(mappedQuality);

      // Load share button mode from database
      const mode = (dbSettings as any)?.shareButtonMode || 'clipboard';
      setShareButtonMode(mode as "clipboard" | "dialog");
      
      const savedImageWidth = localStorage.getItem("imageThumbnailWidth") as string | null;
      setImageThumbnailWidth(savedImageWidth || "w-36");
      
      setIsLoading(false);
    }
  }, [dbSettings]);



  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              // 常に前のページに戻す
              window.history.back();
            }}
            className="flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentT.backToSettings}
          </button>
          <h1 className="text-3xl font-bold">{currentT.siteSettings}</h1>
        </div>

        {/* Site Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="space-y-4">
            {/* Dark Mode Selection */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                {displayTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">{currentT.darkMode}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentT.darkModeDesc}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDisplayTheme('light');
                    if (displayTheme !== 'light' && toggleTheme) toggleTheme();
                    updateSettingsMutation.mutate({ theme: 'light' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    displayTheme === 'light'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Sun className="w-4 h-4 inline mr-1" />
                  {displayLanguage === 'ja' ? 'ライト' : 'Light'}
                </button>
                <button
                  onClick={() => {
                    setDisplayTheme('dark');
                    if (displayTheme !== 'dark' && toggleTheme) toggleTheme();
                    updateSettingsMutation.mutate({ theme: 'dark' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    displayTheme === 'dark'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Moon className="w-4 h-4 inline mr-1" />
                  {displayLanguage === 'ja' ? 'ダーク' : 'Dark'}
                </button>
              </div>
            </div>

            {/* Share Button Mode Selection */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{currentT.shareButton}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log("Clipboard button clicked");
                    setShareButtonMode("clipboard");
                    console.log("Calling mutation with:", { shareButtonMode: 'clipboard' });
                    updateSettingsMutation.mutate({ shareButtonMode: 'clipboard' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    shareButtonMode === "clipboard"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  {currentT.shareButtonClipboard}
                </button>
                <button
                  onClick={() => {
                    console.log("Dialog button clicked");
                    setShareButtonMode("dialog");
                    console.log("Calling mutation with:", { shareButtonMode: 'dialog' });
                    updateSettingsMutation.mutate({ shareButtonMode: 'dialog' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    shareButtonMode === "dialog"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Share2 className="w-4 h-4 inline mr-1" />
                  {currentT.shareButtonDialog}
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{currentT.language}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentT.languageDesc}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDisplayLanguage('ja');
                    updateSettingsMutation.mutate({ language: 'ja' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    displayLanguage === 'ja'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.japanese}
                </button>
                <button
                  onClick={() => {
                    setDisplayLanguage('en');
                    updateSettingsMutation.mutate({ language: 'en' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    displayLanguage === 'en'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.english}
                </button>
              </div>
            </div>

            {/* Thumbnail Quality Selection */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{currentT.thumbnailQuality}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentT.thumbnailQualityDesc}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => {
                    setThumbnailQuality("default");
                    updateSettingsMutation.mutate({ thumbnailQuality: 'low' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    thumbnailQuality === "default"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.qualityDefault}
                </button>
                <button
                  onClick={() => {
                    setThumbnailQuality("medium");
                    updateSettingsMutation.mutate({ thumbnailQuality: 'medium' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    thumbnailQuality === "medium"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.qualityMedium}
                </button>
                <button
                  onClick={() => {
                    setThumbnailQuality("high");
                    updateSettingsMutation.mutate({ thumbnailQuality: 'high' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    thumbnailQuality === "high"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.qualityHigh}
                </button>
                <button
                  onClick={() => {
                    setThumbnailQuality("maxhigh");
                    updateSettingsMutation.mutate({ thumbnailQuality: 'ultra' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    thumbnailQuality === "maxhigh"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.qualityMaxHigh}
                </button>
                <button
                  onClick={() => {
                    setThumbnailQuality("ultra");
                    updateSettingsMutation.mutate({ thumbnailQuality: 'maximum' });
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    thumbnailQuality === "ultra"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {currentT.qualityUltra}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
