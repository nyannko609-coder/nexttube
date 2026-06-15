import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Subscriptions() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  const { data: subscriptions } = trpc.subscriptions.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{language === 'en' ? 'Please log in to view subscriptions' : '登録チャンネルを表示するにはログインしてください'}</p>
          <Button onClick={() => setLocation("/")}>{language === 'en' ? 'Back to Home' : 'ホームに戻る'}</Button>
        </div>
      </div>
    );
  }

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : '戻る'}
          </Button>
          <picture>
            <source srcSet={theme === 'dark' ? '/nexttube-logo-dark.png' : '/nexttube-logo.png'} />
            <img src={theme === 'dark' ? '/nexttube-logo-dark.png' : '/nexttube-logo.png'} alt="NextTube" className="h-12" />
          </picture>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-8">{language === 'en' ? 'Subscriptions' : '登録チャンネル'}</h1>

        <div className="space-y-4">
          {subscriptions && subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptions.map((channel: any, index: number) => (
                <div
                  key={`subscription-${channel.channelId}-${index}`}
                  onClick={() => setLocation(`/channel-videos/${channel.channelId}`)}
                  className="group cursor-pointer p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full bg-muted mb-3 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      {channel.channelThumbnailUrl ? (
                        <img
                          src={channel.channelThumbnailUrl}
                          alt={channel.channelTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Bell className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-accent">
                      {channel.channelTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(channel.subscribedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{language === 'en' ? 'No subscribed channels' : '登録したチャンネルはまだありません'}</p>
              <Button onClick={() => setLocation("/search?q=popular")}>{language === 'en' ? 'Find Channels' : 'チャンネルを探す'}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
