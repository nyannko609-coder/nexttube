import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Library, Play, Wrench, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollapsibleSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button
        onClick={toggleSidebar}
        className="fixed top-0 left-0 z-[60] p-3 rounded-none bg-background border-b border-r border-border hover:bg-accent transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* サイドバー背景（オーバーレイ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="p-6 pt-20 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">NextTube</h2>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="p-4 flex flex-col gap-10">
          {/* ホーム */}
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-base"
              onClick={() => setIsOpen(false)}
            >
              <Home className="mr-3" size={20} />
              <span>ホーム</span>
            </Button>
          </Link>

          {/* 後で見る */}
          <Link href="/library">
            <Button
              variant="ghost"
              className="w-full justify-start text-base"
              onClick={() => setIsOpen(false)}
            >
              <Library className="mr-3" size={20} />
              <span>後で見る</span>
            </Button>
          </Link>

          {/* 登録チャンネル */}
          <Link href="/subscriptions">
            <Button
              variant="ghost"
              className="w-full justify-start text-base"
              onClick={() => setIsOpen(false)}
            >
              <Play className="mr-3" size={20} />
              <span>登録チャンネル</span>
            </Button>
          </Link>

          {/* ツール */}
          <Link href="/tools">
            <Button
              variant="ghost"
              className="w-full justify-start text-base"
              onClick={() => setIsOpen(false)}
            >
              <Wrench className="mr-3" size={20} />
              <span>ツール</span>
            </Button>
          </Link>

          {/* 設定 */}
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start text-base"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3" size={20} />
              <span>設定</span>
            </Button>
          </Link>
        </nav>
      </aside>
    </>
  );
}
