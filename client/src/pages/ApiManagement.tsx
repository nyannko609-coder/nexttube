import { Button } from "@/components/ui/button";
import { Play, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApiManagement() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  // 管理者以外はアクセス不可
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);
  
  const { data: apiStatus, isLoading, isError, error, refetch } = trpc.apiManagement.getStatus.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [apiMode, setApiMode] = useState<"auto" | "manual">("auto");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);
  
  const setActiveKeyMutation = trpc.apiManagement.setActiveKey.useMutation();
  const resetQuotaMutation = trpc.apiManagement.resetQuota.useMutation();
  const clearCacheMutation = trpc.apiManagement.clearCache.useMutation();

  // ページリロード時にデータをリセット
  useEffect(() => {
    // ページリロード時にセッションストレージをクリア（ページ閉じるとクリア）
    sessionStorage.removeItem("apiManagementState");
    // ローカルストレージもクリア
    localStorage.removeItem("apiManagementState");
    
    // 状態をリセット
    setSelectedKey("");
    setApiMode("auto");
    setPasswordInput("");
    setPasswordError("");
    
    // APIデータを強制的に再取得
    refetch();
  }, []);

  // 自動更新の処理
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        await refetch();
        setLastError(null);
      } catch (err: any) {
        console.error('[ApiManagement] Auto-refresh error:', err);
        setLastError(err?.message || 'Failed to refresh API status');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // エラーが発生した場合、lastError を更新
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch API status';
      setLastError(errorMessage);
    }
  }, [isError, error]);

  const handleKeyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const keyNumber = parseInt(e.target.value);
    if (keyNumber > 0) {
      setSelectedKey(e.target.value);
      try {
        await setActiveKeyMutation.mutateAsync({ keyNumber });
        // キー切り替え後にデータを更新
        await refetch();
      } catch (error) {
        console.error('Failed to set active key:', error);
        setSelectedKey("");
      }
    }
  };

  const handleModeChange = (newMode: "auto" | "manual") => {
    if (newMode === "manual") {
      // 手動モードに変更する場合はパスワード入力が必要
      setShowPasswordDialog(true);
    } else {
      // 自動モードに戻す場合はそのまま変更
      setApiMode("auto");
      setPasswordInput("");
      setPasswordError("");
    }
  };

  const handlePasswordSubmit = () => {
    const correctPassword = "63756042199";
    if (passwordInput === correctPassword) {
      setApiMode("manual");
      setShowPasswordDialog(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("パスワードが正しくありません");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Play className="w-8 h-8 text-accent fill-accent" />
            <span className="text-2xl font-bold text-foreground">VideoHub</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">API管理</h1>
          <Button onClick={() => setLocation("/")}>ホーム</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Error Alert */}
        {(lastError || isError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500 mb-1">エラーが発生しました</h3>
              <p className="text-sm text-red-500/80">{lastError || (error instanceof Error ? error.message : 'Failed to fetch API status')}</p>
            </div>
            <button
              onClick={() => {
                setLastError(null);
                refetch();
              }}
              className="flex-shrink-0 text-red-500 hover:text-red-600 font-medium text-sm"
            >
              再試行
            </button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              YouTube Data API キー管理
            </h2>
            <p className="text-muted-foreground">
              24個のAPIキーの使用状況とクォータをリアルタイムで監視
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              自動更新
            </label>
            <Button onClick={async () => {
              // リセットボタン：APIキーをリセット
              try {
                await resetQuotaMutation.mutateAsync();
                sessionStorage.removeItem("apiManagementState");
                localStorage.removeItem("apiManagementState");
                setSelectedKey("");
                setApiMode("auto");
                setPasswordInput("");
                setPasswordError("");
                refetch();
              } catch (error) {
                console.error('Failed to reset quota:', error);
              }
            }}>
              リセット
            </Button>
            <Button onClick={async () => {
              // キャッシュクリアボタン：検索キャッシュをクリア
              try {
                await clearCacheMutation.mutateAsync();
                setLastError(null);
              } catch (error) {
                console.error('Failed to clear cache:', error);
              }
            }}>
              キャッシュクリア
            </Button>
            <Button onClick={() => refetch()}>更新</Button>
          </div>
        </div>

        {/* API Mode Selection */}
        <div className="mb-6 bg-card rounded-lg border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-3">
            APIモード:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleModeChange("auto")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                apiMode === "auto"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              自動モード
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                apiMode === "manual"
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Lock className="w-4 h-4" />
              手動モード
            </button>
          </div>
          {apiMode === "manual" && (
            <p className="text-xs text-orange-500 mt-2 font-semibold">
              ⚠️ 手動モード: キーを手動で選択して使用します
            </p>
          )}
        </div>

        {/* Manual Key Selection */}
        <div className="mb-6 bg-card rounded-lg border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            手動選択:
          </label>
          <select
            id="key-select"
            value={selectedKey}
            onChange={handleKeyChange}
            disabled={setActiveKeyMutation.isPending || apiMode === "auto"}
            className="w-full max-w-xs px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
          >
            <option value="">キーを選択...</option>
            {apiStatus?.map((key) => (
              <option key={key.keyNumber} value={key.keyNumber}>
                キー #{key.keyNumber}
              </option>
            ))}
          </select>
          {setActiveKeyMutation.isPending && (
            <p className="text-xs text-muted-foreground mt-2">切り替え中...</p>
          )}
          {setActiveKeyMutation.isError && (
            <p className="text-xs text-destructive mt-2">
              エラー: キーの切り替えに失敗しました
            </p>
          )}
          {apiMode === "auto" && (
            <p className="text-xs text-muted-foreground mt-2">
              自動モード時は手動選択は無効です
            </p>
          )}
        </div>

        {isLoading && !apiStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-lg border border-border p-4 animate-pulse"
              >
                <div className="bg-muted h-4 w-20 rounded mb-4" />
                <div className="space-y-2">
                  <div className="bg-muted h-3 w-full rounded" />
                  <div className="bg-muted h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : apiStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {apiStatus.map((key) => (
              <div
                key={key.keyNumber}
                className={`bg-card rounded-lg border-2 p-4 transition-colors ${
                  key.isActive
                    ? "border-green-500"
                    : "border-destructive opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground">
                    キー #{key.keyNumber}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      key.isActive
                        ? "bg-green-500/20 text-green-500"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {key.isActive ? "有効" : "無効"}
                  </span>
                </div>



                {/* Error Info */}
                {key.errorCount > 0 && (
                  <div className="bg-destructive/10 rounded p-2 mb-3">
                    <p className="text-xs text-destructive font-semibold">
                      エラー: {key.errorCount}件
                    </p>
                    {key.lastErrorAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        最終: {new Date(key.lastErrorAt).toLocaleString("ja-JP")}
                      </p>
                    )}
                  </div>
                )}

                {/* Last Reset */}
                <div className="text-xs text-muted-foreground">
                  リセット: {new Date(key.lastResetAt).toLocaleString("ja-JP")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">API ステータスを取得できません</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {apiStatus && (
            <>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">有効なキー</p>
                <p className="text-3xl font-bold text-accent">
                  {apiStatus.filter((k) => k.isActive).length}/25
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">平均クォータ使用率</p>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(
                    apiStatus.reduce((sum, k) => sum + k.quotaPercentage, 0) /
                      apiStatus.length
                  )}%
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">総エラー数</p>
                <p className="text-3xl font-bold text-destructive">
                  {apiStatus.reduce((sum, k) => sum + k.errorCount, 0)}
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground mb-2">総クォータ残量</p>
                <p className="text-3xl font-bold text-accent">
                  {(
                    apiStatus.reduce((sum, k) => sum + k.quotaRemaining, 0) / 1000
                  ).toFixed(1)}k
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-accent/10 rounded-lg border border-accent/20 p-6">
          <h3 className="font-bold text-foreground mb-2">ℹ️ 情報</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• キー #1～#24: YouTube API V3 の公式キー</li>
            <li>• キー #25: 自作 API プロキシキー</li>
            <li>• 毎日日本時間17:00にクォータがリセットされます</li>
            <li>• エラーが発生したキーは自動的に無効化されます</li>
            <li>• 自動モード: システムが最適なキーを自動選択</li>
            <li>• 手動モード: 指定したキーを使用（パスワード保護）</li>
          </ul>
        </div>
      </main>

      {/* Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>手動モードに変更</AlertDialogTitle>
            <AlertDialogDescription>
              手動モードに変更するにはパスワードが必要です
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="パスワードを入力"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePasswordSubmit();
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => {
              setPasswordInput("");
              setPasswordError("");
            }}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>
              確認
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
