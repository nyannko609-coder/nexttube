import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect, useState, useCallback } from "react";
import { trpc } from "./lib/trpc";
import { useSetTheme } from "./contexts/ThemeContext";
import { useLanguage } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import ApiManagement from "./pages/ApiManagement";
import Library from "./pages/Library";
import Subscriptions from "./pages/Subscriptions";
import Tools from "./pages/Tools";
import ToolUrlConverter from "./pages/ToolUrlConverter";
import ChannelVideos from "./pages/ChannelVideos";
import SeoArticle1 from "./pages/SeoArticle1";
import SeoArticle2 from "./pages/SeoArticle2";
import SeoArticle3 from "./pages/SeoArticle3";
import { Settings } from "./pages/Settings";
import { SettingsAccount } from "./pages/SettingsAccount";
import { SettingsSite } from "./pages/SettingsSite";
import { CollapsibleSidebar } from "./components/CollapsibleSidebar";

function AppContent() {
  const setTheme = useSetTheme();
  const { setLanguage } = useLanguage();
  const { data: dbSettings } = trpc.settings.get.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds for settings changes
  });

  useEffect(() => {
    if (dbSettings?.theme && setTheme) {
      setTheme(dbSettings.theme as 'light' | 'dark');
    }
  }, [dbSettings, setTheme]);

  useEffect(() => {
    if (dbSettings?.language && setLanguage) {
      setLanguage(dbSettings.language as 'ja' | 'en');
    }
  }, [dbSettings, setLanguage]);

  return <Router />;
}

function Router() {
  return (
    <>
      <CollapsibleSidebar />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/watch/:videoId"} component={Watch} />
        <Route path={"/search"} component={Search} />
        <Route path={"/library"} component={Library} />
        <Route path={"/subscriptions"} component={Subscriptions} />
        <Route path={"/tools"} component={Tools} />
        <Route path={"/tools/:toolId"} component={ToolUrlConverter} />
        <Route path={"/channel-videos/:channelId"} component={ChannelVideos} />
        <Route path={"/api-management"} component={ApiManagement} />
        <Route path={"/article/restricted-video-site"} component={SeoArticle1} />
        <Route path={"/article/school-video-site"} component={SeoArticle2} />
        <Route path={"/article/youtube-alternative"} component={SeoArticle3} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/settings/account"} component={SettingsAccount} />
        <Route path={"/settings/site"} component={SettingsSite} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [initialTheme, setInitialTheme] = useState<'light' | 'dark' | undefined>(undefined);
  const [initialLanguage, setInitialLanguage] = useState<'ja' | 'en' | undefined>(undefined);

  return (
    <ErrorBoundary>
      <LanguageProvider initialLanguage={initialLanguage}>
        <ThemeProvider
          defaultTheme="light"
          switchable={true}
          initialTheme={initialTheme}
        >
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
