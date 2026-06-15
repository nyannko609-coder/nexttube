import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Video {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

interface ChannelVideosResult {
  items: Video[];
  nextPageToken?: string;
}

export default function ChannelVideos() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/channel-videos/:channelId");
  const channelId = params?.channelId;
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  // 無限読み込み用の状態
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [channelInfo, setChannelInfo] = useState<any>(null);


  // チャンネル情報を取得
  const { data: channelData, isLoading: isLoadingChannel } = trpc.video.getChannel.useQuery(
    { channelId: channelId || "" },
    { enabled: !!channelId }
  );

  // 初回チャンネル動画を取得
  const { data: results, isLoading } = trpc.channel.getVideos.useQuery(
    { channelId: channelId || "", maxResults: 30 },
    { enabled: !!channelId }
  );

  // 次ページ読み込み用のクエリ
  const { data: moreResults, refetch: refetchMore } = trpc.channel.getVideos.useQuery(
    { channelId: channelId || "", maxResults: 30, pageToken },
    { enabled: false } // 手動で呼び出す
  );

  // チャンネル情報を処理
  useEffect(() => {
    if (channelData) {
      setChannelInfo(channelData);
    }
  }, [channelData]);

  // 初回検索結果を処理
  useEffect(() => {
    if (results) {
      setAllVideos(results.items || []);
      setPageToken(results.nextPageToken);
      setHasMore(!!results.nextPageToken);
      console.log("[ChannelVideos] Initial results loaded:", results.items?.length);
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
      setHasMore(!!moreResults.nextPageToken);
      setIsLoadingMore(false);
      console.log(
        "[ChannelVideos] Loaded more videos. New videos:",
        newVideos.length,
        "Total now:",
        allVideos.length + newVideos.length
      );
    }
  }, [moreResults, allVideos]);

  // スクロールイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      // ページ下部から400px以内でトリガー
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
      ) {
        if (hasMore && !isLoadingMore && !isLoading && pageToken) {
          setIsLoadingMore(true);
          console.log("[ChannelVideos] Scroll triggered - loading more videos");
          refetchMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, isLoading, pageToken, refetchMore]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ログインしてください</p>
          <Button onClick={() => setLocation("/")}>ホームに戻る</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "en" ? "Back" : "戻る"}
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {channelInfo?.title || "チャンネル動画"}
        </h1>
        {channelInfo?.description && (
          <p className="text-muted-foreground mb-8">{channelInfo.description}</p>
        )}

        {allVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allVideos.map((video: Video) => (
                <div
                  key={video.videoId}
                  onClick={() => setLocation(`/watch/${video.videoId}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-muted mb-3 aspect-video">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-accent">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                </div>
              ))}
            </div>

            {isLoadingMore && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}

            {!hasMore && (
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">すべての動画を読み込みました</p>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="flex justify-center gap-1 mb-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-muted-foreground">動画を読み込み中...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">このチャンネルの動画はまだありません</p>
            <Button onClick={() => setLocation("/library")}>ライブラリに戻る</Button>
          </div>
        )}
      </div>
    </div>
  );
}
