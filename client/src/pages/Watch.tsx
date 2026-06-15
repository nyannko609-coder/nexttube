import { Input } from "@/components/ui/input";
import { Share2, MoreVertical, ThumbsUp, ThumbsDown, Clock, Bell, ArrowLeft, Download, Search, Copy, Check, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { recordSettingsNavigation } from "./Settings";

// YouTube IFrame API を読み込む
if (typeof window !== 'undefined' && !(window as any).YT) {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareButtonMode, setShareButtonMode] = useState<"clipboard" | "dialog">("clipboard");
  const thumbnailWidth = import.meta.env.VITE_THUMBNAIL_WIDTH || "w-36";
  const [watchedTime, setWatchedTime] = useState<number | null>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);

  const { data: video, isLoading: videoLoading } = trpc.video.getDetails.useQuery(
    { videoId: videoId || "" },
    { enabled: !!videoId }
  );

  const [allComments, setAllComments] = useState<any[]>([]);
  const [commentPageToken, setCommentPageToken] = useState<string | undefined>();
  const [isLoadingAllComments, setIsLoadingAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const utils = trpc.useUtils();

  const addCommentMutation = trpc.video.addComment.useMutation({
    onSuccess: (newComment) => {
      setAllComments([newComment, ...allComments]);
      setCommentText("");
      toast.success(language === "en" ? "Comment added successfully" : "コメントが追加されました");
    },
    onError: () => {
      toast.error(language === "en" ? "Failed to add comment" : "コメント追加に失敗しました");
    },
  });

  const { data: comments, isLoading: commentsLoading } = trpc.video.getComments.useQuery(
    { videoId: videoId || "", maxResults: video?.commentCount || 20 },
    { enabled: !!videoId && !!video && showComments } // Only load comments when button is clicked
  );

  // Auto-load all comments based on commentCount
  useEffect(() => {
    if (!comments || !video?.commentCount || isLoadingAllComments) return;

    setAllComments(comments.items);
    setCommentPageToken(comments.nextPageToken);

    // If we have more comments to load, fetch them
    if (comments.nextPageToken && comments.items.length < video.commentCount) {
      setIsLoadingAllComments(true);
      const loadMoreComments = async () => {
        try {
          let currentPageToken = comments.nextPageToken;
          let loadedComments = [...comments.items];

          while (currentPageToken && loadedComments.length < video.commentCount) {
            const nextData = await utils.video.getComments.fetch({
              videoId: videoId || "",
              maxResults: video.commentCount || 20,
              pageToken: currentPageToken,
            } as any);
            loadedComments = [...loadedComments, ...nextData.items];
            currentPageToken = nextData.nextPageToken;
          }

          setAllComments(loadedComments);
          setCommentPageToken(currentPageToken);
        } catch (error) {
          console.error("Failed to load all comments:", error);
        } finally {
          setIsLoadingAllComments(false);
        }
      };
      loadMoreComments();
    } else {
      setIsLoadingAllComments(false);
    }
  }, [comments, video?.commentCount, videoId]);

  // Related videos with infinite scroll
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [relatedPageToken, setRelatedPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedInitialRelated, setHasLoadedInitialRelated] = useState(false);
  const relatedContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: initialRelated } = trpc.video.getRelated.useQuery(
    { videoId: videoId || "", maxResults: 50 },
    { enabled: !!videoId && !!video } // Delay loading related videos until video details are loaded
  );

  // Suppress the unused variable warning
  void commentPageToken;

  // Load user settings to get shareButtonMode
  // (commentPageToken is used for tracking pagination state)
  const { data: userSettings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Watch time tracking
  const saveWatchTimeMutation = trpc.watchTime.save.useMutation();

  useEffect(() => {
    // Load share button mode from user settings (database)
    const mode = (userSettings as any)?.shareButtonMode;
    if (mode) {
      setShareButtonMode(mode as "clipboard" | "dialog");
    } else {
      // Fallback to localStorage for backward compatibility
      const savedShareMode = localStorage.getItem("shareButtonMode") as "clipboard" | "dialog" | null;
      setShareButtonMode(savedShareMode || "clipboard");
    }
    
    // Log thumbnail width from environment
    console.log("Thumbnail width:", thumbnailWidth);
  }, [thumbnailWidth, userSettings, isAuthenticated]);

  // 視聴済み時間を取得
  useEffect(() => {
    if (videoId) {
      const savedTime = localStorage.getItem(`video_progress_${videoId}`);
      if (savedTime) {
        setWatchedTime(parseInt(savedTime, 10));
      }
    }
  }, [videoId]);

  // YouTube IFrame API の初期化と再生位置の復元
  useEffect(() => {
    const win = window as any;
    if (typeof window === 'undefined' || !win.YT) return;

    const initPlayer = () => {
      if (playerRef.current) return; // Already initialized

      const iframe = document.querySelector(`iframe[src*="youtube.com/embed/${videoId}"]`) as HTMLIFrameElement;
      if (!iframe) return;

      try {
        playerRef.current = new win.YT.Player(iframe, {
          events: {
            onReady: (event: any) => {
              console.log("[Watch] Player ready");
              // 保存された再生位置から再生開始
              if (watchedTime && watchedTime > 0) {
                event.target.seekTo(watchedTime);
                console.log(`[Watch] Seeking to ${watchedTime} seconds`);
              }
              // 再生位置を5秒ごとに保存
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              progressIntervalRef.current = setInterval(() => {
                const currentTime = event.target.getCurrentTime();
                const currentTimeMinutes = Math.floor(currentTime / 60);
                localStorage.setItem(`video_progress_${videoId}`, Math.floor(currentTime).toString());
                console.log(`[Watch] Saved progress: ${Math.floor(currentTime)}s`);
                
                // Save to database if user is authenticated
                if (isAuthenticated && videoId) {
                  const videoDuration = event.target.getDuration();
                  const videoDurationMinutes = Math.floor(videoDuration / 60);
                  saveWatchTimeMutation.mutate({
                    videoId,
                    watchedMinutes: currentTimeMinutes,
                    totalDurationMinutes: videoDurationMinutes,
                  });
                }
              }, 5000);
            },
            onStateChange: (event: any) => {
              if (event.data === win.YT.PlayerState.UNSTARTED) {
                // プレイヤーが準備完了
                if (watchedTime && watchedTime > 0) {
                  event.target.seekTo(watchedTime);
                }
              }
            },
          },
        });
      } catch (error) {
        console.error("[Watch] Failed to initialize player:", error);
      }
    };

    // YouTube APIが読み込まれるまで待機
    if (win.YT && win.YT.Player) {
      initPlayer();
    } else {
      const checkInterval = setInterval(() => {
        if (win.YT && win.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId, watchedTime]);

  useEffect(() => {
    if (initialRelated) {
      const videos = Array.isArray(initialRelated) ? initialRelated : (initialRelated as any).items || [];
      const nextToken = Array.isArray(initialRelated) ? undefined : (initialRelated as any).nextPageToken;
      setRelatedVideos(videos);
      setRelatedPageToken(nextToken);
      setHasLoadedInitialRelated(true);
      console.log("[Watch] Initial related videos loaded:", videos.length, "nextPageToken:", nextToken);
    }
  }, [initialRelated, videoId]);

  const { refetch: refetchMoreRelated } = trpc.video.getRelated.useQuery(
    { videoId: videoId || "", maxResults: 50, pageToken: relatedPageToken },
    { enabled: false }
  );

  const loadMoreRelated = useCallback(async () => {
    console.log("[Watch] loadMoreRelated called - videoId:", videoId, "isLoadingMore:", isLoadingMore, "relatedPageToken:", relatedPageToken);
    
    if (!videoId || isLoadingMore || !relatedPageToken) {
      console.log("[Watch] loadMoreRelated early return - videoId:", !!videoId, "isLoadingMore:", isLoadingMore, "relatedPageToken:", !!relatedPageToken);
      return;
    }

    setIsLoadingMore(true);
    try {
      console.log("[Watch] Fetching more related videos with pageToken:", relatedPageToken);
      const result = await refetchMoreRelated();
      console.log("[Watch] Fetch result:", result);
      
      if (result.data) {
        const newVideos = Array.isArray(result.data) ? result.data : (result.data as any).items || [];
        const existingVideoIds = new Set(relatedVideos.map((v) => v.videoId));
        const uniqueNewVideos = newVideos.filter(
          (newVideo: any) => !existingVideoIds.has(newVideo.videoId)
        );
        setRelatedVideos((prev) => [...prev, ...uniqueNewVideos]);
        setRelatedPageToken(Array.isArray(result.data) ? undefined : (result.data as any)?.nextPageToken);
        console.log(
          "[Watch] Loaded more related videos. New videos:",
          uniqueNewVideos.length,
          "Total now:",
          relatedVideos.length + uniqueNewVideos.length,
          "nextPageToken:",
          Array.isArray(result.data) ? undefined : (result.data as any)?.nextPageToken
        );
      }
    } catch (error) {
      console.error("[Watch] Failed to load more related videos:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [videoId, relatedPageToken, isLoadingMore, relatedVideos, refetchMoreRelated]);

  // Infinite scroll observer - use sentinel element at the bottom
  useEffect(() => {
    console.log("[Watch] Setting up IntersectionObserver");
    
    const options = {
      root: null,
      rootMargin: "200px",
      threshold: 0.01
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        console.log("[Watch] Sentinel visibility:", entry.isIntersecting, "relatedPageToken:", relatedPageToken, "isLoadingMore:", isLoadingMore);
        if (entry.isIntersecting && !isLoadingMore && relatedPageToken) {
          console.log("[Watch] Triggering loadMoreRelated from sentinel");
          loadMoreRelated();
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options);

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
      console.log("[Watch] Observing sentinel element");
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log("[Watch] IntersectionObserver disconnected");
      }
    };
  }, [loadMoreRelated, isLoadingMore, relatedPageToken]);

  const addToWatchHistory = trpc.watchHistory.add.useMutation();
  const removeFromWatchHistory = trpc.watchHistory.remove.useMutation();
  const addToSubscriptions = trpc.subscriptions.add.useMutation();
  const removeFromSubscriptions = trpc.subscriptions.remove.useMutation();

  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [isChannelSubscribed, setIsChannelSubscribed] = useState(false);
  const [checkingWatchLater, setCheckingWatchLater] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [relatedWatchLaterStates, setRelatedWatchLaterStates] = useState<Record<string, boolean>>({});

  // 後で見るに追加済みかチェック
  const { data: watchHistoryData } = trpc.watchHistory.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated && !!videoId }
  );

  useEffect(() => {
    if (watchHistoryData) {
      const isInList = watchHistoryData.some((item: any) => item.videoId === videoId);
      setIsInWatchLater(isInList || false);
      setCheckingWatchLater(false);
    }
  }, [watchHistoryData, videoId]);

  // チャンネル登録済みかチェック
  const { data: subscriptionsData } = trpc.subscriptions.list.useQuery(
    undefined,
    { enabled: isAuthenticated && !!video?.channelId }
  );

  useEffect(() => {
    if (subscriptionsData && video?.channelId) {
      const isSubscribed = subscriptionsData.some((item: any) => item.channelId === video.channelId);
      setIsChannelSubscribed(isSubscribed || false);
      setCheckingSubscription(false);
    }
  }, [subscriptionsData, video?.channelId]);

  const handleAddToWatchLater = async () => {
    if (!video || !isAuthenticated) return;
    
    try {
      if (isInWatchLater) {
        await removeFromWatchHistory.mutateAsync({ videoId: video.id });
      } else {
        await addToWatchHistory.mutateAsync({
          videoId: video.id,
          videoTitle: video.title,
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl,
        });
      }
      setIsInWatchLater(!isInWatchLater);
    } catch (error) {
      console.error("Failed to update watch later:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!video || !isAuthenticated) return;
    
    try {
      if (isChannelSubscribed) {
        await removeFromSubscriptions.mutateAsync({ channelId: video.channelId });
      } else {
        await addToSubscriptions.mutateAsync({
          channelId: video.channelId,
          channelTitle: video.channelTitle,
        });
      }
      setIsChannelSubscribed(!isChannelSubscribed);
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDownload = () => {
    if (!video) return;
    
    // Open SaveFrom.net download page in a new tab
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;
    const saveFromUrl = `https://savefrom.net/${youtubeUrl}`;
    window.open(saveFromUrl, '_blank');
    
    // Show toast notification
    toast(
      language === "en"
        ? "Opening download page..."
        : "ダウンロードページを開いています..."
    );
  };

  // Show skeleton while loading video details
  useEffect(() => {
    if (video && !showVideoDetails) {
      // Delay showing details by 100ms to ensure smooth transition
      const timer = setTimeout(() => setShowVideoDetails(true), 100);
      return () => clearTimeout(timer);
    }
  }, [video, showVideoDetails]);

  if (!video) {
    return <div className="min-h-screen bg-background"></div>;
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <picture>
            <source srcSet={theme === 'dark' ? '/nexttube-logo-dark.png' : '/nexttube-logo.png'} />
            <img
              src={theme === 'dark' ? '/nexttube-logo-dark.png' : '/nexttube-logo.png'}
              alt="NextTube"
              className="h-10 cursor-pointer"
              onClick={() => setLocation("/")}
            />
          </picture>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="flex gap-2">
              <Input
                placeholder={language === "en" ? "Search..." : "検索..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full"
              />
              <button type="submit" className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                recordSettingsNavigation();
                setLocation("/settings");
              }}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              {language === "en" ? "Settings" : "設定"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full flex flex-col lg:flex-row gap-6 px-0 lg:px-6 py-6">
        {/* Video Player and Info - Left Side */}
        <div className="flex-1 lg:w-13/20">
            {/* Back Button - Top Left */}
            <div className="mb-4 px-6 lg:px-0">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === "en" ? "Back" : "戻る"}
              </button>
            </div>

            {/* Video Player */}
            <div className="relative w-full bg-black overflow-hidden mb-6" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              />
            </div>

            {/* Watched Time Display */}
            {watchedTime !== null && watchedTime > 0 && (
              <div className="px-6 lg:px-0 mb-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">
                  {language === "en" 
                    ? `Watched up to ${Math.floor(watchedTime / 60)}:${String(watchedTime % 60).padStart(2, '0')}`
                    : `${Math.floor(watchedTime / 60)}分${watchedTime % 60}秒まで視聴済み`
                  }
                </span>
              </div>
            )}

            {/* Video Info - Progressive Loading */}
            {showVideoDetails ? (
            <div className="space-y-4 px-6 lg:px-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{video.title}</h1>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (video?.channelId) {
                          setLocation(`/channel-videos/${video.channelId}`);
                        }
                      }}
                      className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                      title={language === "en" ? "Visit channel" : "チャンネルを訪問"}
                    >
                      {video?.channelThumbnailUrl ? (
                        <img
                          src={video.channelThumbnailUrl}
                          alt={video.channelTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <p className="font-semibold text-foreground">{video.channelTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {video.viewCount?.toLocaleString("ja-JP")} {language === "en" ? "views" : "回視聴"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddToWatchLater}
                      disabled={checkingWatchLater}
                      className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors text-sm whitespace-nowrap ${
                        isInWatchLater
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {language === "en" ? "Watch Later" : "後で見る"}
                    </button>
                    <button
                      onClick={handleSubscribe}
                      disabled={checkingSubscription}
                      className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors text-sm whitespace-nowrap ${
                        isChannelSubscribed
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      {isChannelSubscribed ? (language === "en" ? "Subscribed" : "登録済み") : (language === "en" ? "Subscribe" : "登録")}
                    </button>
                    <button
                      onClick={() => {
                        if (shareButtonMode === "clipboard") {
                          navigator.clipboard.writeText(window.location.href);
                          setCopiedId("share-" + videoId);
                          toast(
                            language === "en"
                              ? "Link copied to clipboard"
                              : "リンクがクリップボードにコピーされました"
                          );
                          setTimeout(() => setCopiedId(null), 2000);
                        } else if (shareButtonMode === "dialog") {
                          // 共有ダイアログを表示、クリップボードコピーは実行しない
                          if (navigator.share) {
                            navigator.share({
                              title: video?.title || "Video",
                              text: video?.description || "",
                              url: window.location.href,
                            }).catch(() => {
                              // ダイアログがキャンセルされた場合、何もしない
                            });
                          }
                        } else {
                          // クリップボードコピーモードが使用不可能な場合
                          navigator.clipboard.writeText(window.location.href);
                          toast(
                            language === "en"
                              ? "Link copied to clipboard"
                              : "リンクがクリップボードにコピーされました"
                          );
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-sm whitespace-nowrap"
                    >
                      {copiedId === "share-" + videoId && shareButtonMode === "clipboard" ? (
                        <>
                          <Check className="w-4 h-4" />
                          {language === "en" ? "Copied" : "コピー済み"}
                        </>
                      ) : shareButtonMode === "dialog" ? (
                        <>
                          <Share2 className="w-4 h-4" />
                          {language === "en" ? "Share" : "共有"}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {language === "en" ? "Share" : "共有"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {language === "en" ? "Download" : "ダウンロード"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ) : (
            <div className="space-y-4 px-6 lg:px-0">
              <div className="h-8 bg-muted rounded animate-pulse mb-4"></div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            )}

            {/* Description */}
            {showVideoDetails && (
            <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">{video.description}</p>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8 space-y-4 px-6 lg:px-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{language === "en" ? "Comments" : "コメント"}</h2>
                {!showComments && (
                  <button
                    onClick={() => setShowComments(true)}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-medium"
                  >
                    {language === "en" ? "Load Comments" : "コメントを読み込む"}
                  </button>
                )}
              </div>

              {showComments && (
                <>
                  {isAuthenticated && (
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="コメントを追加..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setCommentText("")}
                          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => {
                            if (commentText.trim() && videoId) {
                              addCommentMutation.mutate({
                                videoId,
                                text: commentText,
                              });
                            }
                          }}
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {addCommentMutation.isPending ? "送信中..." : "コメント"}
                        </button>
                      </div>
                    </div>
                  )}

                  {commentsLoading || isLoadingAllComments ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{language === "en" ? "Loading comments..." : "コメントを読み込み中..."}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allComments.length > 0 ? (
                        allComments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <img
                      src={comment.authorProfileImageUrl}
                      alt={comment.authorName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">
                          {comment.authorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.publishedAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <p className="text-sm text-foreground mb-2">{comment.textDisplay}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="hover:text-accent">👍 {comment.likeCount}</button>
                        <button className="hover:text-accent">返信</button>
                      </div>
                    </div>
                  </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">{language === "en" ? "No comments" : "コメントがありません"}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
        </div>

        {/* Sidebar - Related Videos (YouTube Layout) */}
        <div className="w-full lg:w-7/20">
            <h2 className="text-lg font-bold text-foreground mb-4">{language === "en" ? "Related Videos" : "関連動画"}</h2>
            <div className="space-y-3" ref={relatedContainerRef}>
              {relatedVideos.map((related: any, index: number) => {
                const isInWatchList = relatedWatchLaterStates[related.videoId] ?? (watchHistoryData?.some((item: any) => item.videoId === related.videoId) || false);
                return (
                <div
                  key={`${related.videoId}-${index}`}
                  className="group hover:bg-muted p-2 rounded-lg transition-colors flex gap-3"
                >
                  <div
                    onClick={() => setLocation(`/watch/${related.videoId}`)}
                    className="cursor-pointer flex gap-3 flex-1 min-w-0"
                  >
                    {/* Thumbnail */}
                    <div className={`relative overflow-hidden rounded-lg bg-muted flex-shrink-0 ${thumbnailWidth} h-20 aspect-video`}>
                      <img
                        src={related.thumbnailUrl}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {/* Watch Later Button Overlay */}
                      {isAuthenticated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInWatchList) {
                              removeFromWatchHistory.mutateAsync({ videoId: related.videoId });
                              setRelatedWatchLaterStates((prev) => ({
                                ...prev,
                                [related.videoId]: false,
                              }));
                            } else {
                              addToWatchHistory.mutateAsync({
                                videoId: related.videoId,
                                videoTitle: related.title,
                                channelId: related.channelId,
                                channelTitle: related.channelTitle,
                                thumbnailUrl: related.thumbnailUrl,
                              });
                              setRelatedWatchLaterStates((prev) => ({
                                ...prev,
                                [related.videoId]: true,
                              }));
                            }
                          }}
                          className={`absolute top-1 right-1 p-1 rounded transition-colors ${
                            isInWatchList
                              ? "bg-accent text-accent-foreground hover:bg-accent/90"
                              : "bg-black/70 text-white hover:bg-black/90"
                          }`}
                          title={isInWatchList ? (language === "en" ? "Remove from Watch Later" : "後で見るから削除") : (language === "en" ? "Add to Watch Later" : "後で見るに追加")}
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-accent transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{related.channelTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {related.viewCount?.toLocaleString("ja-JP")} {language === "en" ? "views" : "回視聴"}
                      </p>
                    </div>
                  </div>
                </div>
              );
              })}

              {/* Initial loading indicator */}
              {!hasLoadedInitialRelated && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Loading related videos..." : "関連動画を読み込み中..."}</p>
                </div>
              )}

              {/* Loading indicator for infinite scroll */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              )}

              {/* End of results message */}
              {!relatedPageToken && relatedVideos.length > 0 && hasLoadedInitialRelated && !isLoadingMore && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{language === "en" ? "All related videos loaded" : "すべての関連動画を読み込みました"}</p>
                </div>
              )}

              {/* Sentinel element for infinite scroll */}
              <div ref={sentinelRef} className="h-1" />
            </div>
        </div>
      </div>
    </div>
  );
}
