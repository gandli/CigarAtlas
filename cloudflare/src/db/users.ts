/**
 * User Database Operations
 */

import type { D1Database, D1Result } from '@cloudflare/workers-types';
import type { User } from '../types';
import { now } from './index';

// ============================================================================
// Create
// ============================================================================

export interface CreateUserInput {
  id: string;
  apple_id: string;
  nickname?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  preferences?: string | null;
}

export async function createUser(db: D1Database, input: CreateUserInput): Promise<User> {
  const stmt = db.prepare(`
    INSERT INTO users (id, apple_id, nickname, avatar_url, timezone, preferences, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = await stmt.bind(
    input.id,
    input.apple_id,
    input.nickname ?? null,
    input.avatar_url ?? null,
    input.timezone ?? 'Asia/Shanghai',
    input.preferences ?? null,
    now(),
    now()
  ).run();
  
  if (!result.success) {
    throw new Error(`Failed to create user: ${result.error}`);
  }
  
  return {
    id: input.id,
    apple_id: input.apple_id,
    nickname: input.nickname ?? null,
    avatar_url: input.avatar_url ?? null,
    timezone: input.timezone ?? 'Asia/Shanghai',
    preferences: input.preferences ?? null,
    created_at: now(),
    updated_at: now(),
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Get user by ID
 */
export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const result = await stmt.bind(id).first<User>();
  return result ?? null;
}

/**
 * Get user by Apple ID
 */
export async function getUserByAppleId(db: D1Database, appleId: string): Promise<User | null> {
  const stmt = db.prepare('SELECT * FROM users WHERE apple_id = ?');
  const result = await stmt.bind(appleId).first<User>();
  return result ?? null;
}

/**
 * Get users by IDs (batch)
 */
export async function getUsersByIds(db: D1Database, ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`);
  const result = await stmt.bind(...ids).all<User>();
  return result.results ?? [];
}

// ============================================================================
// Update
// ============================================================================

export interface UpdateUserInput {
  nickname?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  preferences?: string | null;
}

export async function updateUser(db: D1Database, id: string, input: UpdateUserInput): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (input.nickname !== undefined) {
    fields.push('nickname = ?');
    values.push(input.nickname);
  }
  if (input.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(input.avatar_url);
  }
  if (input.timezone !== undefined) {
    fields.push('timezone = ?');
    values.push(input.timezone);
  }
  if (input.preferences !== undefined) {
    fields.push('preferences = ?');
    values.push(input.preferences);
  }
  
  if (fields.length === 0) {
    return getUserById(db, id);
  }
  
  fields.push('updated_at = ?');
  values.push(now());
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = await stmt.bind(...values).run();
  
  if (!result.success) {
    throw new Error(`Failed to update user: ${result.error}`);
  }
  
  return getUserById(db, id);
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete user (cascades to related data via foreign keys)
 */
export async function deleteUser(db: D1Database, id: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = await stmt.bind(id).run();
  return result.success && (result.meta?.changes ?? 0) > 0;
}
