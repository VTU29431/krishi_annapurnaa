import { db } from './index.ts';
import { users } from './schema.ts';
import { inMemoryStore } from './inMemoryStore.ts';

export async function getOrCreateUser(uid: string, email: string, role = 'farmer', fullName?: string) {
  if (process.env.SQL_HOST) {
    try {
      const result = await db
        .insert(users)
        .values({
          uid,
          email,
          role,
          fullName: fullName || null,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email,
            ...(fullName ? { fullName } : {}),
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.warn('Database query error in getOrCreateUser, falling back to in-memory store:', error);
    }
  }

  // Graceful fallback to memory store
  return inMemoryStore.getOrCreateUser(uid, email, role, fullName);
}
