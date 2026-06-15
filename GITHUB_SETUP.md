# NextTube - GitHub Mirror Setup Guide

このガイドは、NextTube プロジェクトを GitHub でセットアップするための手順を説明しています。

## プロジェクト概要

**NextTube** は YouTube の代替プラットフォームで、複数の API キーを管理して無制限に動画を検索・視聴できます。

### 主な機能

- 🔍 **無制限検索**: 複数の API キーでクォータ制限なし
- 📚 **ビデオ管理**: ライブラリ、プレイリスト、視聴履歴
- 🔑 **API 管理**: 24 個の API キーをリアルタイム監視
- 💳 **Stripe 統合**: プレミアム機能の決済対応
- 🌍 **多言語対応**: 日本語、英語など

## 技術スタック

- **フロントエンド**: React 19 + Tailwind CSS 4 + shadcn/ui
- **バックエンド**: Express 4 + tRPC 11 + Drizzle ORM
- **データベース**: MySQL/TiDB
- **キャッシング**: Redis (Upstash)
- **認証**: Manus OAuth
- **支払い**: Stripe

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/YOUR_USERNAME/nexttube.git
cd nexttube
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定します：

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/nexttube

# Authentication
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Redis/Cache
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# YouTube API Keys (複数設定可能)
YOUTUBE_API_KEY_1=your_api_key_1
YOUTUBE_API_KEY_2=your_api_key_2
# ... YOUTUBE_API_KEY_3 to YOUTUBE_API_KEY_24

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key

# App Settings
VITE_APP_TITLE=NextTube
VITE_APP_LOGO=/nexttube-logo-dark.png
VITE_HOME_TITLE=NextTube - YouTube Alternative
VITE_HOME_SUBTITLE=Unlimited Video Search Platform

# Quota Reset (JST)
QUOTA_RESET_HOUR_JST=17
QUOTA_RESET_MINUTE_JST=0

# Features
SWR_ENABLED=true
```

### 4. データベースのセットアップ

```bash
# マイグレーション実行
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# または SQL ファイルを直接実行
mysql -u user -p nexttube < drizzle/migrations/0000_initial.sql
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開きます。

### 6. ビルド

```bash
pnpm build
```

### 7. テスト実行

```bash
pnpm test
```

## ファイル構成

```
nexttube/
├── client/                    # フロントエンド (React)
│   ├── public/               # 静的アセット
│   ├── src/
│   │   ├── pages/           # ページコンポーネント
│   │   ├── components/      # UI コンポーネント
│   │   ├── lib/             # ユーティリティ
│   │   ├── contexts/        # React Context
│   │   ├── hooks/           # カスタムフック
│   │   └── App.tsx          # ルート
│   └── index.html
├── server/                    # バックエンド (Express + tRPC)
│   ├── routers.ts           # tRPC ルーター
│   ├── db.ts                # データベースクエリ
│   ├── youtubeApi.ts        # YouTube API 統合
│   ├── apiKeyManager.ts     # API キー管理
│   ├── stripe.ts            # Stripe 統合
│   ├── videoDb.ts           # ビデオキャッシュ
│   ├── swrCache.ts          # SWR キャッシング
│   └── _core/               # フレームワーク
├── drizzle/
│   ├── schema.ts            # データベーススキーマ
│   └── migrations/          # SQL マイグレーション
├── shared/                   # 共有型・定数
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 主要な API エンドポイント

### 検索
```
GET /api/trpc/videos.search?input={"query":"test","limit":50}
```

### ビデオ詳細
```
GET /api/trpc/videos.getDetails?input={"videoId":"dQw4w9WgXcQ"}
```

### チャンネル情報
```
GET /api/trpc/channels.getInfo?input={"channelId":"UCxxxxxx"}
```

### ライブラリ管理
```
POST /api/trpc/library.addToWatchHistory
POST /api/trpc/library.addToFavorites
POST /api/trpc/library.createPlaylist
```

### API キー管理
```
GET /api/trpc/apiKeys.getStatus
GET /api/trpc/apiKeys.getQuotaUsage
```

## デプロイ

### Vercel へのデプロイ

```bash
vercel deploy
```

### Docker でのデプロイ

```bash
docker build -t nexttube .
docker run -p 3000:3000 nexttube
```

### Railway へのデプロイ

```bash
railway link
railway up
```

## トラブルシューティング

### YouTube API キーが無効
- API キーが有効か確認
- YouTube Data API v3 が有効か確認
- クォータ制限に達していないか確認

### Redis 接続エラー
- Redis サーバーが起動しているか確認
- REDIS_URL が正しいか確認
- ファイアウォール設定を確認

### データベース接続エラー
- DATABASE_URL が正しいか確認
- MySQL/TiDB サーバーが起動しているか確認
- ユーザー権限を確認

## 開発ガイド

### 新機能の追加

1. **スキーマ更新** (`drizzle/schema.ts`)
   ```typescript
   export const newTable = sqliteTable('new_table', {
     id: text('id').primaryKey(),
     // ... columns
   });
   ```

2. **マイグレーション生成**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **DB クエリ追加** (`server/db.ts`)
   ```typescript
   export async function getNewData() {
     return await db.query.newTable.findMany();
   }
   ```

4. **tRPC ルーター追加** (`server/routers.ts`)
   ```typescript
   export const router = t.router({
     newFeature: publicProcedure
       .query(async () => {
         return await getNewData();
       }),
   });
   ```

5. **フロントエンド実装** (`client/src/pages/NewFeature.tsx`)
   ```typescript
   const { data } = trpc.newFeature.useQuery();
   ```

6. **テスト追加** (`server/newFeature.test.ts`)
   ```typescript
   describe('newFeature', () => {
     it('should work', () => {
       // test
     });
   });
   ```

### テスト実行

```bash
# すべてのテストを実行
pnpm test

# 特定のテストを実行
pnpm test server/youtubeApi.test.ts

# ウォッチモード
pnpm test --watch
```

## コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まず Issue を開いて変更内容を説明してください。

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## サポート

問題が発生した場合は、GitHub Issues で報告してください。

## 関連リンク

- [Manus Documentation](https://docs.manus.im)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
