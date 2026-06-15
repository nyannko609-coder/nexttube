import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Zap, Shield, Layers, BookOpen, Globe, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { recordSettingsNavigation } from "./Settings";
import { trpc } from "@/lib/trpc";
import { CreditCard } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { data: paymentStatus } = trpc.payment.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createCheckoutMutation = trpc.payment.createCheckout.useMutation({
    onError: (error) => {
      console.error('[API Mutation Error]', error.message);
    },
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [donationAmount, setDonationAmount] = useState('1');

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    
    setShowDonationDialog(true);
  };

  const handleDonationSubmit = async () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount < 0.5) {
      alert(language === 'en' ? 'Minimum donation is $0.50' : '最小寄付金額は$0.50です');
      return;
    }

    setShowDonationDialog(false);
    setIsCheckingOut(true);
    try {
      console.log('[Donation] Starting checkout with amount:', amount);
      const result = await createCheckoutMutation.mutateAsync({
        origin: window.location.origin,
        amount: Math.round(amount * 100), // Convert to cents
      });
      console.log('[Donation] Checkout result:', result);
      if (result?.url) {
        console.log('[Donation] Opening Stripe URL:', result.url);
        window.open(result.url, '_blank');
      } else {
        console.error('[Donation] No URL in result:', result);
      }
    } catch (error) {
      console.error('[Donation] Error creating checkout session:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Get titles and descriptions from language context or environment variables
  const getHomeTitle = () => {
    if (language === 'en') return import.meta.env.VITE_HOME_TITLE || 'NextTube';
    return import.meta.env.VITE_HOME_TITLE || 'NextTube';
  };
  
  const getHomeSubtitle = () => {
    if (language === 'en') return 'YouTube Alternative - Unlimited Video Search Platform';
    return 'YouTube代替サイト - 無制限動画検索プラットフォーム';
  };
  
  const getFeature1Title = () => {
    if (language === 'en') return 'Unlimited Access';
    return '無制限アクセス';
  };
  
  const getFeature1Desc = () => {
    if (language === 'en') return 'Search and watch YouTube videos without limits using multiple API keys.';
    return '複数のAPIキーで制限なくYouTube動画を検索・視聴できます。';
  };
  
  const getFeature2Title = () => {
    if (language === 'en') return 'Safe Video Management';
    return '安全な動画管理';
  };
  
  const getFeature2Desc = () => {
    if (language === 'en') return 'Save and manage videos with the library feature.';
    return 'ライブラリ機能で動画を保存・管理できます。';
  };
  
  const getFeature3Title = () => {
    if (language === 'en') return 'API Management';
    return 'API管理機能';
  };
  
  const getFeature3Desc = () => {
    if (language === 'en') return 'Monitor the usage of 24 API keys in real-time.';
    return '24個のAPIキーの使用状況をリアルタイムで監視できます。';
  };
  
  const getAboutTitle = () => {
    if (language === 'en') return 'About NextTube';
    return 'NextTubeについて';
  };
  
  const getAboutDesc1 = () => {
    if (language === 'en') return 'NextTube is a YouTube alternative platform that allows unlimited video search and viewing. By managing multiple API keys, you can always access videos stably without hitting quota limits.';
    return 'NextTubeはYouTubeの代替サイトとして、無制限で動画を検索・視聴できるプラットフォームです。複数のAPIキーを管理することで、クォータ制限に引っかかることなく、常に安定して動画にアクセスできます。';
  };
  
  const getAboutDesc2 = () => {
    if (language === 'en') return 'For those looking for YouTube alternatives, those who need API key management, and those who want to manage videos efficiently, NextTube is the perfect platform.';
    return 'YouTube代替サイトをお探しの方、APIキー管理が必要な方、動画を効率的に管理したい方に最適なプラットフォームです。';
  };

  // SEO: Set page title and meta description
  useEffect(() => {
    const title = getHomeTitle();
    document.title = `${title} - YouTube代暿サイト | 無制限動画検索・管理プラットフォーム`;
    
    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', `${title}はYouTube代暿サイトです。制限なく動画検索・視聴でき、複数APIキーで無制限アクセス。トレンド動画、ライブラリ管理、API管理機能を備えた次世代動画プラットフォーム。`);

    // Set keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'YouTube代暿, 動画検索, 動画管理, トレンド動画, 無制限動画, API管理, 動画プラットフォーム, NextTube');
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <picture>
              <source srcSet="/nexttube-logo.webp" type="image/webp" media="(prefers-color-scheme: light)" />
              <img src="/nexttube-logo.png" alt="NextTube - YouTube代替サイト" className="h-14 dark:hidden" />
            </picture>
            <picture className="hidden dark:block">
              <img src="/nexttube-logo-dark.png" alt="NextTube - YouTube代替サイト" className="h-14" />
            </picture>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setLocation("/library")}>
                  {language === 'en' ? 'Watch Later' : '後で見る'}
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/subscriptions")}>
                  {language === 'en' ? 'Subscriptions' : '登録チャンネル'}
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/api-management")}>
                  {t.nav.apiManagement}
                </Button>
                <Button variant="ghost" onClick={() => {
                  recordSettingsNavigation();
                  setLocation("/settings");
                }} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === 'en' ? 'Settings' : '設定'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button asChild>
                  <a href={getLoginUrl()}>{language === 'en' ? 'Login' : 'ログイン'}</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Google Style */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">{getHomeTitle()}</h1>
          <p className="text-xl text-muted-foreground">{getHomeSubtitle()}</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-12">
          <div className="flex gap-2 bg-card rounded-full border border-border shadow-md p-2">
            <Input
              placeholder={t.home.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:outline-none"
            />
            <Button type="submit" size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </form>

        {/* Purchase Section */}
        {isAuthenticated && (
          <section className="w-full max-w-4xl mb-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-8 text-center text-white shadow-lg">
            <div className="flex justify-center mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            {paymentStatus?.hasPaid ? (
              <>
                <h2 className="text-2xl font-bold mb-2">{language === 'en' ? 'Thank you for your support!' : 'ご支援ありがとうございます！'}</h2>
                <p className="mb-6">{language === 'en' ? 'Support NextTube further with an additional donation' : 'NextTubeをさらにサポートしてください'}</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">{language === 'en' ? 'Get Permanent Access' : '永遠にアクセス可能'}</h2>
                <p className="mb-6">{language === 'en' ? 'Support NextTube with any donation amount' : 'NextTubeをサポートしてください'}</p>
              </>
            )}
            <button
              onClick={handlePurchase}
              disabled={isCheckingOut}
              className="bg-white text-orange-600 font-bold py-2 px-8 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingOut ? (language === 'en' ? 'Processing...' : '処理中...') : paymentStatus?.hasPaid ? (language === 'en' ? 'Donate More' : 'さらに寄付') : (language === 'en' ? 'Donate Now' : '今すぐ寄付')}
            </button>
          </section>
        )}

        {/* Donation Dialog */}
        <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === 'en' ? 'Support NextTube' : 'NextTubeをサポート'}</DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Enter any amount to support NextTube (minimum $0.50)' : 'NextTubeをサポートする金額を入力してください（最小$0.50）'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">$</span>
              <Input
                type="number"
                step="0.01"
                min="0.50"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="1.00"
                className="flex-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDonationDialog(false)}>
                {language === 'en' ? 'Cancel' : 'キャンセル'}
              </Button>
              <Button onClick={handleDonationSubmit} className="bg-orange-600 hover:bg-orange-700">
                {language === 'en' ? 'Donate' : '寄付'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Features Section */}
        <section className="w-full max-w-4xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="flex justify-center mb-3">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{getFeature1Title()}</h3>
              <p className="text-sm text-muted-foreground">{getFeature1Desc()}</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="flex justify-center mb-3">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{getFeature2Title()}</h3>
              <p className="text-sm text-muted-foreground">{getFeature2Desc()}</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="flex justify-center mb-3">
                <Layers className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{getFeature3Title()}</h3>
              <p className="text-sm text-muted-foreground">{getFeature3Desc()}</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full max-w-4xl text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">{getAboutTitle()}</h2>
          <p className="text-lg text-muted-foreground mb-4">{getAboutDesc1()}</p>
          <p className="text-lg text-muted-foreground">{getAboutDesc2()}</p>
        </section>

        {/* Bug Report Section */}
        <section className="w-full max-w-4xl bg-card rounded-lg border border-border p-6">
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
      </main>
    </div>
  );
}
