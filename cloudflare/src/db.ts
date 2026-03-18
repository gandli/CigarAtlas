/**
 * CigarAtlas Database Utilities
 */

import type { D1Database } from '@cloudflare/workers-types';
import { handleD1Error, NotFoundError } from './errors';

// ============================================================================
// Type Helpers
// ============================================================================

export interface D1Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Build pagination offset/limit from page and limit
 */
export function getPaginationParams(page: number = 1, limit: number = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;
  return { offset, limit: safeLimit, page: safePage };
}

/**
 * Build ORDER BY clause safely
 */
export function buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
  if (!sortBy) return 'created_at DESC';
  
  // Whitelist of allowed sort columns for security
  const allowedColumns = [
    'created_at', 'updated_at', 'name', 'id', 
    'temperature', 'humidity', 'logged_at', 
    'next_at', 'rating', 'quantity'
  ];
  
  const column = allowedColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  
  return `${column} ${order}`;
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Execute a query and return results with error handling
 */
export async function query<T>(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<T[]> {
  try {
    const result = await db.prepare(sql).bind(...bindings).all();
    return (result.results || []) as T[];
  } catch (error) {
    throw handleD1Error(error);
  }
}

/**
 * Execute a query and return first result
 */
export async function queryFirst<T>(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<T | null> {
  try {
    const result = await db.prepare(sql).bind(...bindings).first();
    return (result as T) || null;
  } catch (error) {
    throw handleD1Error(error);
  }
}

/**
 * Execute an insert/update/delete operation
 */
export async function execute(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<{ changes: number; lastInsertRowid: string }> {
  try {
    const result = await db.prepare(sql).bind(...bindings).run();
    return {
      changes: result.meta.changes || 0,
      lastInsertRowid: String(result.meta.last_row_id || '0'),
    };
  } catch (error) {
    throw handleD1Error(error);
  }
}

/**
 * Get a single row by ID, throw NotFoundError if not found
 */
export async function getById<T extends { id: string }>(
  db: D1Database,
  table: string,
  id: string
): Promise<T> {
  const row = await queryFirst<T>(db, `SELECT * FROM ${table} WHERE id = ?`, id);
  if (!row) {
    throw new NotFoundError(table, id);
  }
  return row;
}

/**
 * Delete a row by ID
 */
export async function deleteById(
  db: D1Database,
  table: string,
  id: string
): Promise<boolean> {
  const result = await execute(db, `DELETE FROM ${table} WHERE id = ?`, id);
  return result.changes > 0;
}

// ============================================================================
// JSON Helpers
// ============================================================================

/**
 * Safely parse JSON string, return null on error
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify to JSON, return null on error
 */
export function safeJsonStringify(obj: unknown): string | null {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}