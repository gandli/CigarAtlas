/**
 * Humidor Database Operations
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { Humidor } from '../types';
import { now } from './index';

// ============================================================================
// Create
// ============================================================================

export interface CreateHumidorInput {
  id: string;
  user_id: string;
  name: string;
  type: 'cabinet' | 'cooler' | 'desktop' | 'travel';
  description?: string | null;
  target_temperature_min?: number;
  target_temperature_max?: number;
  target_humidity_min?: number;
  target_humidity_max?: number;
  image_url?: string | null;
  capacity?: number | null;
  is_default?: number;
}

export async function createHumidor(db: D1Database, input: CreateHumidorInput): Promise<Humidor> {
  const stmt = db.prepare(`
    INSERT INTO humidors (
      id, user_id, name, type, description,
      target_temperature_min, target_temperature_max,
      target_humidity_min, target_humidity_max,
      image_url, capacity, is_default,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = await stmt.bind(
    input.id,
    input.user_id,
    input.name,
    input.type,
    input.description ?? null,
    input.target_temperature_min ?? 16.0,
    input.target_temperature_max ?? 18.0,
    input.target_humidity_min ?? 65.0,
    input.target_humidity_max ?? 70.0,
    input.image_url ?? null,
    input.capacity ?? null,
    input.is_default ?? 0,
    now(),
    now()
  ).run();
  
  if (!result.success) {
    throw new Error(`Failed to create humidor: ${result.error}`);
  }
  
  return {
    id: input.id,
    user_id: input.user_id,
    name: input.name,
    type: input.type,
    description: input.description ?? null,
    target_temperature_min: input.target_temperature_min ?? 16.0,
    target_temperature_max: input.target_temperature_max ?? 18.0,
    target_humidity_min: input.target_humidity_min ?? 65.0,
    target_humidity_max: input.target_humidity_max ?? 70.0,
    image_url: input.image_url ?? null,
    capacity: input.capacity ?? null,
    is_default: input.is_default ?? 0,
    created_at: now(),
    updated_at: now(),
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Get humidor by ID
 */
export async function getHumidorById(db: D1Database, id: string): Promise<Humidor | null> {
  const stmt = db.prepare('SELECT * FROM humidors WHERE id = ?');
  const result = await stmt.bind(id).first<Humidor>();
  return result ?? null;
}

/**
 * Get all humidors for a user
 */
export async function getHumidorsByUserId(db: D1Database, userId: string): Promise<Humidor[]> {
  const stmt = db.prepare('SELECT * FROM humidors WHERE user_id = ? ORDER BY is_default DESC, created_at ASC');
  const result = await stmt.bind(userId).all<Humidor>();
  return result.results ?? [];
}

/**
 * Get humidors by IDs (batch)
 */
export async function getHumidorsByIds(db: D1Database, ids: string[]): Promise<Humidor[]> {
  if (ids.length === 0) return [];
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`SELECT * FROM humidors WHERE id IN (${placeholders})`);
  const result = await stmt.bind(...ids).all<Humidor>();
  return result.results ?? [];
}

/**
 * Get default humidor for a user
 */
export async function getDefaultHumidor(db: D1Database, userId: string): Promise<Humidor | null> {
  const stmt = db.prepare('SELECT * FROM humidors WHERE user_id = ? AND is_default = 1 LIMIT 1');
  const result = await stmt.bind(userId).first<Humidor>();
  return result ?? null;
}

/**
 * Get humidor count for a user
 */
export async function getHumidorCount(db: D1Database, userId: string): Promise<number> {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM humidors WHERE user_id = ?');
  const result = await stmt.bind(userId).first<{ count: number }>();
  return result?.count ?? 0;
}

// ============================================================================
// Update
// ============================================================================

export interface UpdateHumidorInput {
  name?: string;
  type?: 'cabinet' | 'cooler' | 'desktop' | 'travel';
  description?: string | null;
  target_temperature_min?: number;
  target_temperature_max?: number;
  target_humidity_min?: number;
  target_humidity_max?: number;
  image_url?: string | null;
  capacity?: number | null;
  is_default?: number;
}

export async function updateHumidor(db: D1Database, id: string, input: UpdateHumidorInput): Promise<Humidor | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.type !== undefined) {
    fields.push('type = ?');
    values.push(input.type);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    values.push(input.description);
  }
  if (input.target_temperature_min !== undefined) {
    fields.push('target_temperature_min = ?');
    values.push(input.target_temperature_min);
  }
  if (input.target_temperature_max !== undefined) {
    fields.push('target_temperature_max = ?');
    values.push(input.target_temperature_max);
  }
  if (input.target_humidity_min !== undefined) {
    fields.push('target_humidity_min = ?');
    values.push(input.target_humidity_min);
  }
  if (input.target_humidity_max !== undefined) {
    fields.push('target_humidity_max = ?');
    values.push(input.target_humidity_max);
  }
  if (input.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(input.image_url);
  }
  if (input.capacity !== undefined) {
    fields.push('capacity = ?');
    values.push(input.capacity);
  }
  if (input.is_default !== undefined) {
    fields.push('is_default = ?');
    values.push(input.is_default);
  }
  
  if (fields.length === 0) {
    return getHumidorById(db, id);
  }
  
  fields.push('updated_at = ?');
  values.push(now());
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE humidors
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = await stmt.bind(...values).run();
  
  if (!result.success) {
    throw new Error(`Failed to update humidor: ${result.error}`);
  }
  
  return getHumidorById(db, id);
}

/**
 * Batch update humidors (useful for unsetting defaults)
 */
export async function batchUpdateHumidors(
  db: D1Database,
  updates: Array<{ id: string; fields: UpdateHumidorInput }>
): Promise<void> {
  const batch = updates.map(({ id, fields }) => {
    const updateStmt = updateHumidor(db, id, fields);
    return updateStmt;
  });
  
  await Promise.all(batch);
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete humidor (cascades to related data via foreign keys)
 */
export async function deleteHumidor(db: D1Database, id: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM humidors WHERE id = ?');
  const result = await stmt.bind(id).run();
  return result.success && (result.meta?.changes ?? 0) > 0;
}

/**
 * Delete multiple humidors (batch operation)
 */
export async function deleteHumidors(db: D1Database, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM humidors WHERE id IN (${placeholders})`);
  const result = await stmt.bind(...ids).run();
  return result.meta?.changes ?? 0;
}
