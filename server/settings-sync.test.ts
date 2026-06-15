import { describe, it, expect, beforeEach } from 'vitest';
import { getUserSettingsByUserId, upsertUserSettings } from './db';

/**
 * このテストは複数デバイス同期機能を検証します
 * 
 * シナリオ：
 * 1. デバイスAで設定を変更 → データベースに保存
 * 2. デバイスBでページ読み込み → データベースから取得
 * 3. 両デバイスの設定が同じであることを確認
 */

describe('Multi-Device Settings Sync', () => {
  const testUserId = 1;

  describe('Database Save and Load', () => {
    it('should save settings to database and retrieve them', async () => {
      // Device A: Save settings
      const deviceASettings = {
        thumbnailQuality: 'ultra' as const,
        language: 'ja' as const,
        theme: 'dark' as const,
        autoplay: 1,
      };

      const savedSettings = await upsertUserSettings(testUserId, deviceASettings);
      expect(savedSettings).toBeDefined();
      expect(savedSettings?.thumbnailQuality).toBe('ultra');
      expect(savedSettings?.language).toBe('ja');
      expect(savedSettings?.theme).toBe('dark');
    });

    it('should retrieve the same settings on different device', async () => {
      // Device A: Save settings
      await upsertUserSettings(testUserId, {
        thumbnailQuality: 'maximum',
        language: 'en',
        theme: 'light',
        autoplay: 0,
      });

      // Device B: Retrieve settings
      const retrievedSettings = await getUserSettingsByUserId(testUserId);
      
      expect(retrievedSettings).toBeDefined();
      expect(retrievedSettings?.thumbnailQuality).toBe('maximum');
      expect(retrievedSettings?.language).toBe('en');
      expect(retrievedSettings?.theme).toBe('light');
      expect(retrievedSettings?.autoplay).toBe(0);
    });

    it('should update settings and reflect changes immediately', async () => {
      // Device A: Initial settings
      await upsertUserSettings(testUserId, {
        thumbnailQuality: 'high',
        language: 'ja',
        theme: 'dark',
      });

      // Device A: Update settings
      const updatedSettings = await upsertUserSettings(testUserId, {
        thumbnailQuality: 'ultra',
        language: 'en',
      });

      expect(updatedSettings?.thumbnailQuality).toBe('ultra');
      expect(updatedSettings?.language).toBe('en');
      expect(updatedSettings?.theme).toBe('dark'); // Should remain unchanged

      // Device B: Retrieve updated settings
      const deviceBSettings = await getUserSettingsByUserId(testUserId);
      
      expect(deviceBSettings?.thumbnailQuality).toBe('ultra');
      expect(deviceBSettings?.language).toBe('en');
      expect(deviceBSettings?.theme).toBe('dark');
    });

    it('should handle partial updates correctly', async () => {
      // Device A: Set all settings
      await upsertUserSettings(testUserId, {
        thumbnailQuality: 'high',
        language: 'ja',
        theme: 'dark',
        autoplay: 1,
      });

      // Device A: Update only one setting
      const partialUpdate = await upsertUserSettings(testUserId, {
        thumbnailQuality: 'maximum',
      });

      expect(partialUpdate?.thumbnailQuality).toBe('maximum');
      expect(partialUpdate?.language).toBe('ja'); // Should remain
      expect(partialUpdate?.theme).toBe('dark'); // Should remain
      expect(partialUpdate?.autoplay).toBe(1); // Should remain

      // Device B: Verify all settings are correct
      const deviceBSettings = await getUserSettingsByUserId(testUserId);
      
      expect(deviceBSettings?.thumbnailQuality).toBe('maximum');
      expect(deviceBSettings?.language).toBe('ja');
      expect(deviceBSettings?.theme).toBe('dark');
      expect(deviceBSettings?.autoplay).toBe(1);
    });

    it('should sync settings across multiple sequential updates', async () => {
      // Simulate Device A making multiple changes
      const updates = [
        { thumbnailQuality: 'low' as const },
        { language: 'en' as const },
        { theme: 'light' as const },
        { autoplay: 0 },
      ];

      for (const update of updates) {
        await upsertUserSettings(testUserId, update);
      }

      // Device B: Retrieve final settings
      const finalSettings = await getUserSettingsByUserId(testUserId);
      
      expect(finalSettings?.thumbnailQuality).toBe('low');
      expect(finalSettings?.language).toBe('en');
      expect(finalSettings?.theme).toBe('light');
      expect(finalSettings?.autoplay).toBe(0);
    });
  });

  describe('Database Query Performance', () => {
    it('should retrieve settings quickly', async () => {
      await upsertUserSettings(testUserId, {
        thumbnailQuality: 'ultra',
        language: 'ja',
        theme: 'dark',
      });

      const startTime = Date.now();
      const settings = await getUserSettingsByUserId(testUserId);
      const endTime = Date.now();

      expect(settings).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
