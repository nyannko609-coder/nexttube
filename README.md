# NextTube - YouTube Alternative Platform

<div align="center">

![NextTube Logo](client/public/nexttube-logo-dark.png)

**Unlimited Video Search & Management Platform**

[![GitHub Stars](https://img.shields.io/github/stars/YOUR_USERNAME/nexttube?style=flat-square)](https://github.com/YOUR_USERNAME/nexttube)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-green?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue?style=flat-square)](https://www.typescriptlang.org)

[Quick Start](#quick-start) • [Features](#features) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

**NextTube** is a YouTube alternative platform that allows unlimited video search and viewing by managing multiple YouTube API keys. Never hit quota limits again!

### Why NextTube?

- 🔑 **Multiple API Keys**: Manage up to 24 YouTube API keys simultaneously
- 🚀 **Unlimited Access**: No quota limits with automatic key rotation
- 📚 **Video Management**: Save, organize, and manage your videos
- ⚡ **Fast & Responsive**: Optimized caching and performance
- 🔒 **Secure**: OAuth authentication and encrypted storage
- 💳 **Premium Features**: Stripe integration for monetization
- 🌍 **Multi-language**: Support for multiple languages

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🔍 **Unlimited Search** | Search YouTube videos without quota limits |
| 📺 **Video Details** | Get comprehensive video information |
| 👤 **Channel Info** | Browse channel details and videos |
| 💬 **Comments** | View video comments and discussions |
| 📋 **Playlists** | Create and manage custom playlists |
| ❤️ **Favorites** | Save your favorite videos |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

### Advanced Features

| Feature | Description |
|---------|-------------|
| 🔄 **Auto Rotation** | Automatic API key rotation |
| 📊 **Usage Tracking** | Real-time quota usage monitoring |
| ⏰ **Auto Reset** | Daily quota reset at configurable time |
| 🎨 **Dark Mode** | Beautiful dark theme |
| 🌐 **Multi-language** | Japanese, English, and more |
| 💰 **Stripe Integration** | Payment processing for premium features |
| 🔐 **OAuth Auth** | Secure user authentication |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm (or npm)
- MySQL 8+ or PostgreSQL
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nexttube.git
   cd nexttube
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Setup database**
   ```bash
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
http://localhost:3000
```

---

## 📋 Configuration

### Environment Variables

See [.env.example](.env.example) for all available options.

**Required Variables:**
```env
DATABASE_URL=mysql://user:password@localhost:3306/nexttube
JWT_SECRET=your-secret-key
YOUTUBE_API_KEY_1=your-api-key
```

**Optional Variables:**
```env
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
VITE_APP_ID=your-manus-app-id
```

### YouTube API Keys

Get your API keys from [Google Cloud Console](https://console.cloud.google.com):

1. Create a new project
2. Enable YouTube Data API v3
3. Create an API key
4. Add to `.env.local` as `YOUTUBE_API_KEY_1`, `YOUTUBE_API_KEY_2`, etc.

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19
- Tailwind CSS 4
- shadcn/ui
- tRPC (client)
- Vite

**Backend:**
- Express 4
- tRPC 11
- Drizzle ORM
- Node.js

**Database:**
- MySQL / TiDB
- Redis (caching)

**Services:**
- Stripe (payments)
- Manus OAuth
- YouTube Data API v3

### Project Structure

```
nexttube/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Root component
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC routers
│   ├── db.ts              # Database queries
│   ├── youtubeApi.ts      # YouTube integration
│   ├── apiKeyManager.ts   # API key management
│   └── _core/             # Framework code
├── drizzle/               # Database schema
├── shared/                # Shared types
└── package.json
```

---

## 🔌 API Endpoints

### Video Search
```
POST /api/trpc/videos.search
Input: { query: string, limit?: number, offset?: number }
```

### Video Details
```
GET /api/trpc/videos.getDetails
Input: { videoId: string }
```

### Channel Info
```
GET /api/trpc/channels.getInfo
Input: { channelId: string }
```

### Library Management
```
POST /api/trpc/library.addToWatchHistory
POST /api/trpc/library.addToFavorites
POST /api/trpc/library.createPlaylist
GET /api/trpc/library.getWatchHistory
```

### API Key Status
```
GET /api/trpc/apiKeys.getStatus
GET /api/trpc/apiKeys.getQuotaUsage
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/youtubeApi.test.ts

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

---

## 🏭 Building

```bash
# Development build
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

---

## 📦 Deployment

### Vercel

```bash
vercel deploy
```

### Railway

```bash
railway link
railway up
```

### Docker

```bash
docker build -t nexttube .
docker run -p 3000:3000 nexttube
```

### Self-hosted

```bash
pnpm build
NODE_ENV=production node dist/index.js
```

---

## 🐛 Troubleshooting

### YouTube API Key Issues
- Verify API key is valid
- Check YouTube Data API v3 is enabled
- Ensure quota limit not exceeded

### Database Connection Error
- Verify DATABASE_URL is correct
- Check MySQL/PostgreSQL is running
- Confirm user permissions

### Redis Connection Error
- Check Redis is running
- Verify REDIS_URL is correct
- Check firewall settings

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md)
- [Setup Guide](GITHUB_SETUP.md)
- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/nexttube.git
cd nexttube
pnpm install
pnpm dev

# Make changes and test
pnpm test

# Submit PR
```

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 Support

- 🐛 [Report a Bug](https://github.com/YOUR_USERNAME/nexttube/issues)
- 💬 [Start a Discussion](https://github.com/YOUR_USERNAME/nexttube/discussions)
- 📧 [Email Support](mailto:support@nexttube.com)

---

## 🌟 Show Your Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🔗 Sharing with others
- 💬 Providing feedback
- 🤝 Contributing code

---

<div align="center">

Made with ❤️ by the NextTube Team

[GitHub](https://github.com/YOUR_USERNAME/nexttube) • [Website](https://nexttube.com) • [Twitter](https://twitter.com/nexttube)

</div>
