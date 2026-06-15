# NextTube クイックスタートガイド

## 5分でセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/nexttube.git
cd nexttube
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 環境変数を設定

`.env.local` ファイルを作成：

```env
# 最小限の設定
DATABASE_URL=mysql://root:password@localhost:3306/nexttube
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379

# YouTube API キー（複数設定可能）
YOUTUBE_API_KEY_1=your_api_key_here

# Manus OAuth (オプション)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
```

### 4. データベースをセットアップ

```bash
# MySQL/TiDB サーバーを起動
mysql -u root -p

# データベースを作成
CREATE DATABASE nexttube;
USE nexttube;

# マイグレーションを実行
pnpm drizzle-kit migrate
```

### 5. 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開く

## 主な機能

### 動画検索
- 複数の YouTube API キーで無制限検索
- キャッシング機能で高速化
- フィルタリング機能

### ビデオ管理
- ライブラリに保存
- プレイリスト作成
- 視聴履歴

### API 管理
- 24 個の API キーをリアルタイム監視
- クォータ使用状況の追跡
- 日次リセット機能

## よくある質問

### Q: YouTube API キーはどこで取得？
A: [Google Cloud Console](https://console.cloud.google.com) で取得できます

### Q: Redis は必須？
A: キャッシング機能を使う場合は必須です。[Upstash](https://upstash.com) で無料で利用可能

### Q: データベースは何を使う？
A: MySQL、PostgreSQL、TiDB などに対応しています

### Q: 本番環境へのデプロイは？
A: Vercel、Railway、Docker など複数の方法に対応

## トラブルシューティング

### ポート 3000 が既に使用中
```bash
PORT=3001 pnpm dev
```

### npm vs pnpm
```bash
# pnpm がない場合はインストール
npm install -g pnpm
```

### データベース接続エラー
```bash
# MySQL が起動しているか確認
mysql -u root -p

# または Docker で起動
docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8
```

## 次のステップ

1. [完全なセットアップガイド](GITHUB_SETUP.md) を読む
2. [開発ガイド](GITHUB_SETUP.md#開発ガイド) で新機能を追加
3. [テスト](GITHUB_SETUP.md#テスト実行) を書く
4. [デプロイ](GITHUB_SETUP.md#デプロイ) して本番環境で実行

## リソース

- 📚 [ドキュメント](https://docs.manus.im)
- 🐛 [Issue を報告](https://github.com/YOUR_USERNAME/nexttube/issues)
- 💬 [ディスカッション](https://github.com/YOUR_USERNAME/nexttube/discussions)
- 🌟 [Star をお願いします！](https://github.com/YOUR_USERNAME/nexttube)

## ライセンス

MIT License
