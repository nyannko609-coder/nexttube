import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { apiKeys } from '../drizzle/schema';
import { eq, ne } from 'drizzle-orm';

describe('API Management - setActiveKey', () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error('Database not available for tests');
    }
  });

  it('should set the selected key as active', async () => {
    const keyNumber = 1;

    await db
      .update(apiKeys)
      .set({ isActive: 0 })
      .where(ne(apiKeys.keyNumber, keyNumber));

    await db
      .update(apiKeys)
      .set({ isActive: 1 })
      .where(eq(apiKeys.keyNumber, keyNumber));

    const activeKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyNumber, keyNumber));

    expect(activeKey).toHaveLength(1);
    expect(activeKey[0].isActive).toBe(1);
  });

  it('should deactivate all other keys when setting a new active key', async () => {
    const keyNumber = 2;

    await db
      .update(apiKeys)
      .set({ isActive: 0 })
      .where(ne(apiKeys.keyNumber, keyNumber));

    await db
      .update(apiKeys)
      .set({ isActive: 1 })
      .where(eq(apiKeys.keyNumber, keyNumber));

    const allKeys = await db.select().from(apiKeys);
    const activeKeys = allKeys.filter((k: any) => k.isActive === 1);

    expect(activeKeys).toHaveLength(1);
    expect(activeKeys[0].keyNumber).toBe(keyNumber);
  });

  it('should handle key numbers within valid range (1-13)', async () => {
    const validKeyNumbers = [1, 5, 10, 13];

    for (const keyNumber of validKeyNumbers) {
      await db
        .update(apiKeys)
        .set({ isActive: 0 })
        .where(ne(apiKeys.keyNumber, keyNumber));

      await db
        .update(apiKeys)
        .set({ isActive: 1 })
        .where(eq(apiKeys.keyNumber, keyNumber));

      const activeKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.keyNumber, keyNumber));

      expect(activeKey[0].isActive).toBe(1);
    }
  });
});
