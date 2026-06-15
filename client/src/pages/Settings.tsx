import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, User, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

// 設定ページに遷移する前に、遷移元のパスをsessionStorageに記録
export function recordSettingsNavigation() {
  sessionStorage.setItem('settingsFromPath', window.location.pathname);
}

export function Settings() {
  const { language } = useLanguage();
  const [location, setLocation] = useLocation();
  const [fromPath, setFromPath] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorageから遷移元のパスを取得
    const path = sessionStorage.getItem('settingsFromPath');
    setFromPath(path);
    
    // 取得後はクリア
    sessionStorage.removeItem('settingsFromPath');
  }, []);

  const t = {
    ja: {
      backToHome: "戻る",
      settings: "設定",
      accountSettings: "アカウント設定",
      siteSettings: "サイト仕様",
    },
    en: {
      backToHome: "Back",
      settings: "Settings",
      accountSettings: "Account Settings",
      siteSettings: "Site Settings",
    },
  };

  const currentT = t[language as keyof typeof t] || t.ja;

  return (
    <div className="bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-1">
          <button
            onClick={() => {
              // 常に前のページに戻す
              window.history.back();
            }}
            className="flex items-center gap-2 text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentT.backToHome}
          </button>
          <h1 className="text-3xl font-bold">{currentT.settings}</h1>
        </div>

        {/* Settings Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings Card */}
          <button
            onClick={() => setLocation("/settings/account")}
            className="bg-card rounded-lg border border-border p-2 hover:shadow-lg hover:border-primary transition-all text-left min-h-fit"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{currentT.accountSettings}</h2>
            </div>
          </button>

          {/* Site Settings Card */}
          <button
            onClick={() => setLocation("/settings/site")}
            className="bg-card rounded-lg border border-border p-2 hover:shadow-lg hover:border-primary transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{currentT.siteSettings}</h2>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
