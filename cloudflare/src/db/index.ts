/**
 * Database Utilities
 * Common database operations and helpers
 */

import type { Env, User, Humidor, Cigar, EnvironmentLog, Reminder } from '../types';

// Re-export all database operations
export * from './users';
export * from './humidors';
export * from './humidors-stats';
// TODO: export * from './cigars';
// TODO: export * from './environment-logs';
// TODO: export * from './reminders';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique ID (ULID-like format)
 * Format: timestamp (13 digits) + random (9 chars)
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}${random}`;
}

/**
 * Generate a timestamp for database operations
 */
export function now(): string {
  return new Date().toISOString();
}

// ============================================================================
// Pagination Helper
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Apply pagination to a query
 */
export function applyPagination(
  sql: string,
  options: PaginationOptions = {}
): { sql: string; params: unknown[] } {
  const { page = 1, limit = 20, sortBy, sortOrder = 'desc' } = options;
  const offset = (page - 1) * limit;
  
  let query = sql;
  const params: unknown[] = [];
  
  if (sortBy) {
    // Note: In production, validate sortBy against allowed columns
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
  }
  
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  return { sql: query, params };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Build a WHERE clause for optional filters
 */
export function buildWhereClause(
  filters: Record<string, unknown>
): { where: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }
  
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid HumidorType
 */
export function isValidHumidorType(value: string): value is 'cabinet' | 'cooler' | 'desktop' | 'travel' {
  return ['cabinet', 'cooler', 'desktop', 'travel'].includes(value);
}

/**
 * Check if a value is a valid CigarStrength
 */
export function isValidCigarStrength(value: string): value is 'mild' | 'medium' | 'full' {
  return ['mild', 'medium', 'full'].includes(value);
}

/**
 * Check if a value is a valid SmokingStatus
 */
export function isValidSmokingStatus(value: string): value is 'unsmoked' | 'partial' | 'finished' {
  return ['unsmoked', 'partial', 'finished'].includes(value);
}

/**
 * Check if a value is a valid LogSource
 */
export function isValidLogSource(value: string): value is 'manual' | 'sensor' | 'iot' {
  return ['manual', 'sensor', 'iot'].includes(value);
}

/**
 * Check if a value is a valid ReminderType
 */
export function isValidReminderType(value: string): value is 'check' | 'smoke' | 'rotate' | 'hydrate' {
  return ['check', 'smoke', 'rotate', 'hydrate'].includes(value);
}
