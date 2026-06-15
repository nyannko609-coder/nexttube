import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, LogOut, CreditCard, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SettingsAccount() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const { data: paymentStatus } = trpc.payment.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const t = {
    ja: {
      backToSettings: "戻る",
      accountSettings: "アカウント設定",
      accountInfo: "アカウント情報",
      name: "名前",
      email: "メール",
      joined: "参加日",
      paymentHistory: "支払い履歴",
      paymentStatus: "支払いステータス",
      paid: "支払い済み",
      notPaid: "未支払い",
      paidDate: "支払い日",
      logout: "ログアウト",
      logoutDesc: "下のボタンをクリックしてアカウントからログアウトします。",
      logoutButton: "ログアウト",
      loggingOut: "ログアウト中...",
    },
    en: {
      backToSettings: "Back",
      accountSettings: "Account Settings",
      accountInfo: "Account Information",
      name: "Name",
      email: "Email",
      joined: "Joined",
      paymentHistory: "Payment History",
      paymentStatus: "Payment Status",
      paid: "Paid",
      notPaid: "Not Paid",
      paidDate: "Payment Date",
      logout: "Logout",
      logoutDesc: "Click the button below to logout from your account.",
      logoutButton: "Logout",
      loggingOut: "Logging out...",
    },
  };

  const currentT = t[language as keyof typeof t] || t.ja;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Reload the page to clear all session data and redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (language === "en") {
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      return dateObj.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              // 常に前のページに戻す
              window.history.back();
            }}
            className="flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentT.backToSettings}
          </button>
          <h1 className="text-3xl font-bold">{currentT.accountSettings}</h1>
        </div>

        <div className="space-y-6">
          {/* Account Information Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-primary">👤</span>
                  {currentT.accountInfo}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  {currentT.name}
                </p>
                <p className="text-lg font-medium">{user?.name || "N/A"}</p>
              </div>

              <div className="pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  {currentT.email}
                </p>
                <p className="text-lg font-medium">{user?.email || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentT.joined}
                </p>
                <p className="text-lg font-medium">
                  {user?.createdAt
                    ? formatDate(new Date(user.createdAt))
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">{currentT.paymentHistory}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  {currentT.paymentStatus}
                </p>
                <div className="flex items-center gap-2">
                  {paymentStatus?.hasPaid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-lg font-medium text-green-500">{currentT.paid}</p>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-muted-foreground">{currentT.notPaid}</p>
                  )}
                </div>
              </div>
              
              {paymentStatus?.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {currentT.paidDate}
                  </p>
                  <p className="text-lg font-medium">
                    {formatDate(new Date(paymentStatus.paidAt))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold">{currentT.logout}</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              {currentT.logoutDesc}
            </p>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? currentT.loggingOut : currentT.logoutButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
