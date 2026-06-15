import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SeoArticle3() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Play className="w-8 h-8 text-accent fill-accent" />
            <span className="text-2xl font-bold text-foreground">NextTube</span>
          </div>
          <Button onClick={() => setLocation("/")}>ホーム</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-foreground transition-colors">ホーム</a>
          <ChevronRight className="w-4 h-4" />
          <span>YouTube代替サイト</span>
        </div>

        {/* Article Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          【2026年】YouTube代替サイト｜NextTube
        </h1>

        {/* Article Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span>公開日: 2026年3月11日</span>
          <span>更新日: 2026年3月11日</span>
        </div>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none space-y-6">
          {/* Introduction Section */}
          <section>
            <p className="text-lg text-foreground leading-relaxed">
              YouTubeは世界最大の動画プラットフォームですが、時には別の選択肢が欲しいこともあります。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              シンプルに動画を検索したい、軽いサイトを使いたい、そんなときに役立つのがYouTube代替サイトです。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              <strong>NextTubeは、YouTubeの代替として使えるシンプルな動画検索サイトです。</strong>
            </p>
          </section>

          {/* Why YouTube Alternative is Needed */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              YouTubeの代替が必要な理由
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              YouTubeは機能が豊富ですが、その分ページが重くなることがあります。
            </p>
            <div className="bg-card border border-border rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-foreground mb-3">YouTubeの代替が必要な場合：</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>ページが重くて読み込みが遅い</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>余計な機能が多すぎる</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>シンプルに動画を検索したい</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>ネットワークが制限されている環境</span>
                </li>
              </ul>
            </div>
            <p className="text-foreground leading-relaxed">
              このような場合、シンプルな動画検索サイトが便利です。
            </p>
          </section>

          {/* Why NextTube is a Great YouTube Alternative */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              NextTubeがYouTube代替として優れている理由
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              NextTubeは、YouTubeのシンプルな代替として設計されました。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">シンプルなインターフェース</h3>
                <p className="text-sm text-muted-foreground">
                  余計な機能がなく、動画検索に特化したシンプルなデザインです。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">軽くて高速な動作</h3>
                <p className="text-sm text-muted-foreground">
                  ページが軽いので、ネットワークが遅い環境でも快適に使えます。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">余計な広告がない</h3>
                <p className="text-sm text-muted-foreground">
                  シンプルなデザインで、余計な広告が表示されません。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">スマートフォン対応</h3>
                <p className="text-sm text-muted-foreground">
                  スマートフォンでも快適に使える、レスポンシブデザインです。
                </p>
              </div>
            </div>
          </section>

          {/* What You Can Do with NextTube */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              NextTubeでできること
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  🔍
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">動画の検索</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    キーワードで動画を検索できます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  ▶️
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">動画の再生</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    検索結果から動画を選択して再生できます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  📺
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">チャンネルの確認</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    動画のチャンネル情報を確認できます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  🔗
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">関連動画の表示</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    再生中の動画に関連した動画を表示します。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison with YouTube */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              YouTubeとの比較
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">機能</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">NextTube</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">YouTube</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">動画検索</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">動画再生</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">シンプルなUI</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">-</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">軽い・高速</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">-</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-foreground">登録不要</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-foreground">チャンネル登録</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                    <td className="text-center py-3 px-4 text-accent">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              まとめ
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              YouTube代替サイトをお探しでしたら、NextTubeをお試しください。
            </p>
            <p className="text-foreground leading-relaxed">
              <strong>シンプルで使いやすい動画検索が実現できます。</strong>
            </p>
          </section>

          {/* CTA */}
          <div className="flex gap-4 pt-8">
            <Button onClick={() => setLocation("/")} size="lg">
              今すぐ試す
            </Button>
            <Button onClick={() => setLocation("/search")} variant="outline" size="lg">
              動画を検索する
            </Button>
          </div>
        </article>

        {/* Related Articles */}
        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">関連記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/article/restricted-video-site" className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold text-foreground mb-2">制限にかからない動画サイト</h3>
              <p className="text-sm text-muted-foreground">制限にかからない動画サイトについて</p>
            </a>
            <a href="/article/school-video-site" className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold text-foreground mb-2">学校でも見れる動画サイト</h3>
              <p className="text-sm text-muted-foreground">学校のネットワークでも利用しやすい動画検索サイト</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-card border-t border-border">
        <div className="container py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 NextTube. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
