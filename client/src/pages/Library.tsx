
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Library() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const { data: watchLater } = trpc.watchHistory.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{language === 'en' ? 'Please log in to view the library' : 'ライブラリを表示するにはログインしてください'}</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-8">{language === 'en' ? 'Watch Later' : '後で見る'}</h1>

        <div className="space-y-4">
          {watchLater && watchLater.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {watchLater.map((item: any, index: number) => (
                <div
                  key={`watchlater-${item.videoId}-${index}`}
                  onClick={() => setLocation(`/watch/${item.videoId}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-muted mb-3 aspect-video">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.videoTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-accent">
                    {item.videoTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">{item.channelTitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{language === 'en' ? 'No videos to watch later' : '後で見る動画はまだありません'}</p>
              <Button onClick={() => setLocation("/")}>{language === 'en' ? 'Find Videos' : '動画を探す'}</Button>
            </div>
          )}
        </div>

        {/* Bug Report Section */}
        <section className="mt-12 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-foreground">{language === 'en' ? 'Found a bug?' : 'バグを発見しましたか？'}</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            {language === 'en' ? 'If you have any issues or suggestions, please let us know through the form below.' : '問題や改善提案があれば、以下のフォームからお知らせください。'}
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <a href="https://forms.gle/tNvurY3VCEwFwmdU6" target="_blank" rel="noopener noreferrer">
              {language === 'en' ? 'Bug Report Form' : 'バグ報告フォーム'}
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
