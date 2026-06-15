// 言語管理システム
export type Language = 'ja' | 'en';

export const translations = {
  ja: {
    // ナビゲーション
    nav: {
      library: 'ライブラリ',
      apiManagement: 'API管理',
      seoArticles: 'SEO記事',
      language: '言語',
    },
    // ホームページ
    home: {
      title: 'NextTube',
      subtitle: 'YouTube代替サイト - 無制限動画検索プラットフォーム',
      searchPlaceholder: '動画を検索...',
      unlimitedAccess: '無制限アクセス',
      unlimitedAccessDesc: '複数のAPIキーで制限なく YouTube 動画を検索・視聴できます。',
      safeVideoManagement: '安全な動画管理',
      safeVideoManagementDesc: 'ライブラリ機能で動画を保存・管理 できます。',
      apiManagementFeature: 'API管理機能',
      apiManagementFeatureDesc: '24個のAPIキーの使用状況をリアル タイムで監視しています。',
      aboutTitle: 'NextTubeについて',
      aboutDesc: 'NextTubeはYouTubeの代替サイトとして、無制限に動画を検索・視聴できるプラットフォームです。複数のAPIキー を管理することで、フォータ制限に引っかかることなく、常に安定して動画にアクセスできます。',
    },
    // SEO記事
    articles: {
      restrictedVideoSite: '制限にかからない動画サイト',
      schoolVideoSite: '学校でも見れる動画サイト',
      youtubeAlternative: 'YouTube代替サイト',
      readMore: '詳しく読む',
      relatedArticles: '関連記事',
    },
    // API管理
    apiManagement: {
      title: 'API管理',
      status: 'ステータス',
      activeKey: 'アクティブキー',
      quota: 'クォータ',
      mode: 'モード',
      auto: '自動',
      manual: '手動',
      password: 'パスワード',
      passwordIncorrect: 'パスワードが正しくありません',
      resetQuota: 'クォータをリセット',
      unauthorized: '管理者のみアクセス可能です',
    },
    // ライブラリ
    library: {
      title: 'ライブラリ',
      watchHistory: '視聴履歴',
      favorites: 'お気に入り',
      playlists: 'プレイリスト',
      subscriptions: 'チャンネル登録',
      empty: 'コンテンツがありません',
    },
    // 動画視聴ページ
    watch: {
      relatedVideos: '関連動画',
      comments: 'コメント',
      subscribe: 'チャンネル登録',
      like: '高く評価',
      dislike: '低く評価',
      share: '共有',
      download: 'ダウンロード',
      addToPlaylist: 'プレイリストに追加',
      noComments: 'コメントがありません',
    },
    // 検索ページ
    search: {
      title: '検索結果',
      noResults: '検索結果がありません',
      searchPlaceholder: '動画を検索...',
      filters: 'フィルター',
      sortBy: '並び替え',
    },
    // チャンネルページ
    channel: {
      videos: 'チャンネル動画',
      subscribers: '登録者',
      about: 'チャンネル概要',
    },
  },
  en: {
    // Navigation
    nav: {
      library: 'Library',
      apiManagement: 'API Management',
      seoArticles: 'SEO Articles',
      language: 'Language',
    },
    // Home page
    home: {
      title: 'NextTube',
      subtitle: 'YouTube Alternative - Unlimited Video Search Platform',
      searchPlaceholder: 'Search videos...',
      unlimitedAccess: 'Unlimited Access',
      unlimitedAccessDesc: 'Search and watch YouTube videos without limits using multiple API keys.',
      safeVideoManagement: 'Safe Video Management',
      safeVideoManagementDesc: 'Save and manage videos with the library feature.',
      apiManagementFeature: 'API Management',
      apiManagementFeatureDesc: 'Monitor the usage of 24 API keys in real-time.',
      aboutTitle: 'About NextTube',
      aboutDesc: 'NextTube is a YouTube alternative platform that allows unlimited video search and viewing. By managing multiple API keys, you can always access videos stably without hitting quota limits.',
    },
    // SEO Articles
    articles: {
      restrictedVideoSite: 'Video Sites Without Restrictions',
      schoolVideoSite: 'Video Sites You Can Watch at School',
      youtubeAlternative: 'YouTube Alternatives',
      readMore: 'Read More',
      relatedArticles: 'Related Articles',
    },
    // API Management
    apiManagement: {
      title: 'API Management',
      status: 'Status',
      activeKey: 'Active Key',
      quota: 'Quota',
      mode: 'Mode',
      auto: 'Auto',
      manual: 'Manual',
      password: 'Password',
      passwordIncorrect: 'Incorrect password',
      resetQuota: 'Reset Quota',
      unauthorized: 'Admin access only',
    },
    // Library
    library: {
      title: 'Library',
      watchHistory: 'Watch History',
      favorites: 'Favorites',
      playlists: 'Playlists',
      subscriptions: 'Subscriptions',
      empty: 'No content available',
    },
    // Watch page
    watch: {
      relatedVideos: 'Related Videos',
      comments: 'Comments',
      subscribe: 'Subscribe',
      like: 'Like',
      dislike: 'Dislike',
      share: 'Share',
      download: 'Download',
      addToPlaylist: 'Add to Playlist',
      noComments: 'No comments',
    },
    // Search page
    search: {
      title: 'Search Results',
      noResults: 'No search results',
      searchPlaceholder: 'Search videos...',
      filters: 'Filters',
      sortBy: 'Sort by',
    },
    // Channel page
    channel: {
      videos: 'Channel Videos',
      subscribers: 'Subscribers',
      about: 'About Channel',
    },
  },
};

// 言語コンテキストを作成
export const getTranslation = (language: Language) => {
  return translations[language];
};

export const getLanguageName = (language: Language): string => {
  return language === 'ja' ? '日本語' : 'English';
};
