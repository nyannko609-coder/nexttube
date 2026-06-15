import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, Mail, Calendar, Settings } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'en' ? 'Access Denied' : 'アクセス拒否'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'en' ? 'Please log in to access your account.' : 'アカウントにアクセスするにはログインしてください。'}
          </p>
          <Button onClick={() => setLocation('/')} className="w-full">
            {language === 'en' ? 'Back to Home' : 'ホームに戻る'}
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getPageTitle = () => {
    if (language === 'en') return 'Account Settings';
    return 'アカウント設定';
  };

  const getAccountInfoLabel = () => {
    if (language === 'en') return 'Account Information';
    return 'アカウント情報';
  };

  const getNameLabel = () => {
    if (language === 'en') return 'Name';
    return '名前';
  };

  const getEmailLabel = () => {
    if (language === 'en') return 'Email';
    return 'メール';
  };

  const getJoinedLabel = () => {
    if (language === 'en') return 'Joined';
    return '参加日';
  };

  const getLogoutButtonLabel = () => {
    if (language === 'en') return 'Logout';
    return 'ログアウト';
  };

  const getBackButtonLabel = () => {
    if (language === 'en') return 'Back to Home';
    return 'ホームに戻る';
  };

  const formatDate = (timestamp: number | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            ← {getBackButtonLabel()}
          </Button>
          <h1 className="text-4xl font-bold text-foreground">{getPageTitle()}</h1>
        </div>

        {/* Account Information Card */}
        <Card className="bg-card border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">{getAccountInfoLabel()}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{getNameLabel()}</p>
                <p className="text-lg font-semibold text-foreground">{user.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Mail className="w-6 h-6 text-accent flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{getEmailLabel()}</p>
                <p className="text-lg font-semibold text-foreground">{user.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-accent flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{getJoinedLabel()}</p>
                <p className="text-lg font-semibold text-foreground">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? 'Settings' : '設定'}
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {language === 'en' 
              ? 'Manage your account settings and site preferences.' 
              : 'アカウント設定とサイト設定を管理します。'}
          </p>
          <Button 
            onClick={() => setLocation('/settings')}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Go to Settings' : '設定に移動'}
          </Button>
        </Card>

        {/* Logout Section */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? 'Logout' : 'ログアウト'}
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {language === 'en' 
              ? 'Click the button below to logout from your account.' 
              : '下のボタンをクリックしてアカウントからログアウトします。'}
          </p>
          <Button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending 
              ? (language === 'en' ? 'Logging out...' : 'ログアウト中...')
              : getLogoutButtonLabel()}
          </Button>
        </Card>
      </div>
    </div>
  );
}
