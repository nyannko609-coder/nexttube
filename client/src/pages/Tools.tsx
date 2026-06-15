import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Link2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Tools() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const handleGoHome = () => {
    setLocation("/");
  };

  const tools = [
    {
      id: "url-converter",
      name: language === 'en' ? "YouTube URL Converter" : "YouTube URLコンバーター",
      description: language === 'en' 
        ? "Convert YouTube URLs to NextTube URLs" 
        : "YouTube URLをNextTube URLに変換",
      icon: Link2,
    },
  ];

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
        <h1 className="text-3xl font-bold text-foreground mb-8">{language === 'en' ? 'Tools' : 'ツール'}</h1>

        {/* Tools Grid */}
        <div className="space-y-4 mb-12">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setLocation(`/tools/${tool.id}`)}
                className="w-full bg-card rounded-lg border border-border p-6 hover:border-accent hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <IconComponent className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{tool.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bug Report Section */}
        <section className="bg-card rounded-lg border border-border p-6">
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
