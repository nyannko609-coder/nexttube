import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SeoArticle1() {
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
          <span>制限にかからない動画サイト</span>
        </div>

        {/* Article Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          【2026年】制限にかからない動画サイトを探している人へ｜NextTube
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
              学校や職場のネットワークでは、動画サイトが制限されていることがあります。そのため、動画を見ようとしてもブロックされてしまうことがあります。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              そんなときに、動画を簡単に検索できるサイトがあると便利です。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              <strong>NextTubeは、動画をすぐに検索できるシンプルなサイトです。</strong>
            </p>
          </section>

          {/* Why Video Sites Are Restricted */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              動画サイトが制限される理由
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              学校や企業では、ネットワーク管理のために一部のサイトが制限されていることがあります。
            </p>
            <div className="bg-card border border-border rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-foreground mb-3">主な理由：</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>ネットワークの負荷を減らすため</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>不適切なコンテンツの防止</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>学習や仕事への集中</span>
                </li>
              </ul>
            </div>
            <p className="text-foreground leading-relaxed">
              そのため、多くの動画サイトがアクセスできないことがあります。
            </p>
          </section>

          {/* NextTube Features */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              NextTubeの特徴
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              NextTubeは、動画検索を簡単にするために作られました。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">シンプルな動画検索</h3>
                <p className="text-sm text-muted-foreground">
                  検索ボックスにキーワードを入力するだけで、動画を探すことができます。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">軽くて高速</h3>
                <p className="text-sm text-muted-foreground">
                  ページが軽いので、ネットワークが遅い環境でも快適に使えます。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">スマホでも使える</h3>
                <p className="text-sm text-muted-foreground">
                  スマートフォンでも快適に動画を検索・再生できます。
                </p>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              使い方
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">NextTubeのトップページにアクセス</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ブラウザでNextTubeのホームページを開きます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">見たい動画のキーワードを入力</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    検索ボックスに動画のタイトルやキーワードを入力します。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">検索結果から動画を選択</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    検索結果から見たい動画をクリックして再生します。
                  </p>
                </div>
              </div>
            </div>
            <p className="text-foreground leading-relaxed mt-6">
              とてもシンプルです。
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              よくある質問
            </h2>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">登録は必要ですか？</h3>
                <p className="text-foreground">
                  いいえ、登録なしで利用できます。ホームページにアクセスするだけで、すぐに動画を検索できます。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">スマホでも使えますか？</h3>
                <p className="text-foreground">
                  はい、スマートフォンでも利用できます。レスポンシブデザインなので、画面サイズに合わせて表示されます。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">無料で使えますか？</h3>
                <p className="text-foreground">
                  基本的な機能は無料で利用できます。追加機能については、今後提供予定です。
                </p>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              まとめ
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              動画を探したいときは、シンプルに検索できるサービスを使うと便利です。
            </p>
            <p className="text-foreground leading-relaxed">
              <strong>NextTubeでは、簡単に動画を検索できます。</strong>制限にかからない動画サイトをお探しでしたら、ぜひNextTubeをお試しください。
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
            <a href="/article/school-video-site" className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold text-foreground mb-2">学校でも見れる動画サイト</h3>
              <p className="text-sm text-muted-foreground">学校のネットワークでも利用しやすい動画検索サイトについて</p>
            </a>
            <a href="/article/youtube-alternative" className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold text-foreground mb-2">YouTube代替サイト</h3>
              <p className="text-sm text-muted-foreground">YouTubeの代替として使えるシンプルな動画検索サイト</p>
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
