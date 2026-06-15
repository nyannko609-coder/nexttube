import { useSearch } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Search, Moon, Sun, Menu, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface Video {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

interface SearchResult {
  items: Video[];
  nextPageToken?: string;
  totalResults: number;
}

export default function SearchPage() {
  const query = new URLSearchParams(useSearch()).get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [thumbnailQuality, setThumbnailQuality] = useState<"default" | "medium" | "high" | "maxhigh" | "ultra">("high");
  
  // localStorage から画質設定を読み込む
  useEffect(() => {
    const savedQuality = localStorage.getItem("thumbnailQuality") as "default" | "medium" | "high" | "maxhigh" | "ultra" | null;
    if (savedQuality) {
      setThumbnailQuality(savedQuality);
    }
  }, []);
  
  // 無限読み込み用の状態
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const nextPageTokenRef = useRef<string | undefined>(undefined);

  // SEO: Set page title and meta description
  useEffect(() => {
    const title = query ? `${query}の検索結果 - NextTube | YouTube代替サイト` : "検索 - NextTube";
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', `${query}に関する動画をNextTubeで検索。YouTube代替サイトで無制限に動画を検索・視聴できます。`);
  }, [query]);

  // 初回検索
  const { data: results, isLoading } = trpc.video.search.useQuery(
    { query: query || "popular", maxResults: 50, thumbnailQuality },
    { enabled: !!query }
  );

  // 次ページ読み込み用のクエリ
  const { data: moreResults, refetch: refetchMore } = trpc.video.search.useQuery(
    { query: query || "popular", maxResults: 50, pageToken: nextPageTokenRef.current, thumbnailQuality },
    { enabled: false } // 手動で呼び出す
  );

  // 初回検索結果を処理
  useEffect(() => {
    if (results) {
      setAllVideos(results.items || []);
      setPageToken(results.nextPageToken);
      nextPageTokenRef.current = results.nextPageToken;
      setTotalResults(results.totalResults);
      setHasMore(!!results.nextPageToken);
      console.log("[Search] Initial results loaded:", results.items?.length, "nextPageToken:", results.nextPageToken);
    }
  }, [results]);

  // 次ページ結果を処理
  useEffect(() => {
    if (moreResults && isLoadingMore) {
      // 既に表示されている動画のIDセットを作成
      const existingVideoIds = new Set(allVideos.map((v) => v.videoId));
      
      // 重複していない動画のみをフィルタリング
      const newVideos = (moreResults.items || []).filter(
        (video) => !existingVideoIds.has(video.videoId)
      );
      
      setAllVideos((prev) => [...prev, ...newVideos]);
      setPageToken(moreResults.nextPageToken);
      nextPageTokenRef.current = moreResults.nextPageToken;
      // nextPageTokenがなくても新しい動画が取得できたなら続行
      const hasNewVideos = newVideos.length > 0;
      setHasMore(!!moreResults.nextPageToken || hasNewVideos);
      setIsLoadingMore(false);
      console.log(
        "[Search] Loaded more videos. New videos:",
        newVideos.length,
        "Total now:",
        allVideos.length + newVideos.length,
        "nextPageToken:",
        moreResults.nextPageToken,
        "hasNewVideos:",
        hasNewVideos
      );
    }
  }, [moreResults]);

  // スクロールイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      // ページ下部から400px以内でトリガー
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
      ) {
        if (hasMore && !isLoadingMore && !isLoading) {
          console.log("[Search] Scroll detected - loading more videos, pageToken:", nextPageTokenRef.current);
          setIsLoadingMore(true);
          refetchMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, isLoading, refetchMore, allVideos.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-0">
            <picture>
              <img
                src="/nexttube-logo.png"
                alt="NextTube - YouTube代替サイト"
                className="h-10 cursor-pointer dark:hidden"
                onClick={() => setLocation("/")}
              />
            </picture>
            <picture className="hidden dark:block">
              <img
                src="/nexttube-logo-dark.png"
                alt="NextTube - YouTube代替サイト"
                className="h-10 cursor-pointer"
                onClick={() => setLocation("/")}
              />
            </picture>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="flex gap-2">
              <Input
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/api-management")}
            >
              API管理
            </Button>
          </div>
          </div>
        </header>

      {/* Search Results */}
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'en' ? `Search results for "${query}"` : `${query}の検索結果`}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? `Found ${totalResults.toLocaleString("en-US")} videos on NextTube` : `NextTubeで ${totalResults.toLocaleString("ja-JP")} 件の動画が見つかりました`}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'en' ? 'Search and watch videos without limits on NextTube, a YouTube alternative.' : 'YouTube代替サイト「NextTube」で、制限なく動画を検索・視聴できます。'}
          </p>
        </div>

        {isLoading && allVideos.length === 0 ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="bg-muted rounded-lg w-64 h-36 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <div className="bg-muted h-4 w-3/4 rounded mb-2 animate-pulse" />
                  <div className="bg-muted h-4 w-1/2 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : allVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t.search.noResults}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {allVideos.map((video, index) => (
                <div
                  key={`${video.videoId}-${index}`}
                  onClick={() => setLocation(`/watch/${video.videoId}`)}
                  className="group cursor-pointer flex gap-4 hover:bg-muted/50 p-4 rounded-lg transition-colors"
                >
                  <div className="relative overflow-hidden rounded-lg bg-muted flex-shrink-0 w-64 h-36">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-accent mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {video.channelTitle}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(video.publishedAt).toLocaleDateString(language === 'en' ? "en-US" : "ja-JP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ローディング表示 */}
            {isLoadingMore && (
              <div className="py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            )}

            {/* 終了メッセージ */}
            {!hasMore && allVideos.length > 0 && !isLoadingMore && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {allVideos.length} 件の動画を表示しています
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="mt-4"
                >
                  ホームに戻る
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
