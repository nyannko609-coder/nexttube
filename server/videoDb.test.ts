import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  addToWatchHistory,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  getPlaylistItems,
} from "./videoDb";
import * as db from "./db";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Video Database Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Watch History", () => {
    it("should add to watch history", async () => {
      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.getDb).mockResolvedValue({
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      } as any);

      await addToWatchHistory({
        userId: 1,
        videoId: "test-video",
        videoTitle: "Test Video",
        channelId: "test-channel",
        channelTitle: "Test Channel",
        thumbnailUrl: "https://example.com/thumb.jpg",
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("Favorites", () => {
    it("should add to favorites", async () => {
      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.getDb).mockResolvedValue({
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      } as any);

      await addToFavorites({
        userId: 1,
        videoId: "test-video",
        videoTitle: "Test Video",
        channelId: "test-channel",
        channelTitle: "Test Channel",
        thumbnailUrl: "https://example.com/thumb.jpg",
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it("should check if video is favorite", async () => {
      const mockSelect = vi.fn().mockResolvedValue([{ id: 1 }]);
      vi.mocked(db.getDb).mockResolvedValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      } as any);

      const result = await isFavorite(1, "test-video");
      expect(result).toBe(true);
    });
  });

  describe("Playlists", () => {
    it("should create a playlist", async () => {
      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.getDb).mockResolvedValue({
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      } as any);

      await createPlaylist({
        userId: 1,
        title: "My Playlist",
        description: "Test playlist",
        isPublic: 0,
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it("should get playlists for user", async () => {
      const mockSelect = vi.fn().mockResolvedValue([
        { id: 1, title: "Playlist 1", userId: 1 },
      ]);
      vi.mocked(db.getDb).mockResolvedValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([
                { id: 1, title: "Playlist 1", userId: 1 },
              ]),
            }),
          }),
        }),
      } as any);

      const result = await getPlaylists(1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Playlist 1");
    });
  });
});
