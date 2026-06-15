import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertCircle, Copy, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function ToolUrlConverter() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [nexttubeUrl, setNexttubeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGoBack = () => {
    setLocation("/tools");
  };

  const extractVideoId = (url: string): string | null => {
    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleConvert = () => {
    setError("");
    const videoId = extractVideoId(youtubeUrl.trim());
    if (videoId) {
      const converted = `${window.location.origin}/watch/${videoId}`;
      setNexttubeUrl(converted);
    } else {
      setError(language === 'en' ? 'Invalid YouTube URL or Video ID' : '無効なYouTube URLまたは動画IDです');
      setNexttubeUrl("");
    }
  };

  const handleCopy = () => {
    if (nexttubeUrl) {
      navigator.clipboard.writeText(nexttubeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {language === 'en' ? 'YouTube URL Converter' : 'YouTube URLコンバーター'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {language === 'en' 
            ? 'Convert YouTube URLs to NextTube URLs' 
            : 'YouTube URLをNextTube URLに変換します'}
        </p>

        {/* Converter Card */}
        <div className="bg-card rounded-lg border border-border p-8 w-full">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'YouTube URL or Video ID' : 'YouTube URLまたは動画ID'}
              </label>
              <Input
                placeholder={language === 'en' 
                  ? 'e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ'
                  : '例: https://www.youtube.com/watch?v=dQw4w9WgXcQ または dQw4w9WgXcQ'}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConvert();
                  }
                }}
              />
            </div>

            <Button onClick={handleConvert} className="bg-orange-500 hover:bg-orange-600 text-white w-full">
              {language === 'en' ? 'Convert' : '変換'}
            </Button>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {nexttubeUrl && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'NextTube URL' : 'NextTube URL'}
                </label>
                <div className="flex gap-2 mb-4">
                  <Input
                    readOnly
                    value={nexttubeUrl}
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={() => setLocation(nexttubeUrl.replace(window.location.origin, ''))}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {language === 'en' ? 'Open in NextTube' : 'NextTubeで開く'}
                </Button>
              </div>
            )}
          </div>
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
