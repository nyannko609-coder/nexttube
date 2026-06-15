import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SeoArticle2() {
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
          <span>学校でも見れる動画サイト</span>
        </div>

        {/* Article Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          【2026年】学校でも見れる動画サイト｜NextTube
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
              学校のネットワークでは、YouTubeなどの動画サイトが制限されていることがあります。授業の合間や休み時間に動画を見たいと思っても、アクセスできないことがあります。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              そんなときに役立つのが、制限が少ないシンプルな動画検索サイトです。
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              <strong>NextTubeは、学校のネットワークでも利用しやすい動画検索サイトです。</strong>
            </p>
          </section>

          {/* Why Video Sites Are Restricted in Schools */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              学校で動画サイトが制限される理由
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              学校では、ネットワークの安定性と学習環境を守るため、一部のサイトが制限されています。
            </p>
            <div className="bg-card border border-border rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-foreground mb-3">主な理由：</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>ネットワークの帯域幅を確保するため</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>不適切なコンテンツへのアクセス防止</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>授業に集中するため</span>
                </li>
              </ul>
            </div>
            <p className="text-foreground leading-relaxed">
              このため、一般的な動画サイトはアクセスできないことが多いです。
            </p>
          </section>

          {/* Why NextTube is Easy to Use at School */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              NextTubeが学校で使いやすい理由
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              NextTubeは、シンプルな設計で、軽くて高速に動作します。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">余計な広告がない</h3>
                <p className="text-sm text-muted-foreground">
                  シンプルなデザインで、余計な広告や機能がありません。
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">ページが軽い</h3>
                <p className="text-sm text-muted-foreground">
                  ページが軽いので読み込みが早く、学校のネットワークでも快適です。
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

          {/* Use Cases at School */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              学校での使用例
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  📚
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">授業の予習・復習</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    授業で習った内容の参考動画を検索して、理解を深めることができます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  🎵
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">昼休みに好きなアーティストの動画を検索</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    休み時間に好きな音楽やアーティストの動画を楽しむことができます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                  ⚽
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">部活動の参考動画を検索</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    部活動の技術向上のために、参考動画を検索して学ぶことができます。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              使用時の注意
            </h2>
            <p className="text-foreground leading-relaxed">
              学校のネットワークを利用する際は、学校のルールに従ってください。NextTubeは、学習や適切な用途での利用を想定しています。
            </p>
          </section>

          {/* Summary */}
          <section className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              まとめ
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              学校のネットワークでも動画を見たいときは、NextTubeを試してみてください。
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
