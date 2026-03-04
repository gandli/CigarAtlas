/**
 * Database Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  now,
  applyPagination,
  calculatePagination,
  buildWhereClause,
  isValidHumidorType,
  isValidCigarStrength,
  isValidSmokingStatus,
  isValidLogSource,
  isValidReminderType,
} from '../db/index';

describe('Database Utilities - ID Generation', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs in correct format', () => {
    const id = generateId();
    
    // Should be at least 20 characters (timestamp + random)
    expect(id.length).toBeGreaterThanOrEqual(20);
    // Should be alphanumeric
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it('should generate IDs with increasing timestamps', () => {
    const id1 = generateId();
    // Small delay to ensure timestamp changes
    const start = Date.now();
    while (Date.now() === start) {
      // Wait for timestamp to change
    }
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
  });
});

describe('Database Utilities - Timestamp', () => {
  it('should return ISO 8601 format', () => {
    const timestamp = now();
    
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });

  it('should return valid date', () => {
    const timestamp = now();
    const date = new Date(timestamp);
    
    expect(date.toISOString()).toBe(timestamp);
  });
});

describe('Database Utilities - Pagination', () => {
  describe('applyPagination', () => {
    it('should apply default pagination', () => {
      const baseSql = 'SELECT * FROM users';
      const result = applyPagination(baseSql);
      
      expect(result.sql).toContain('ORDER BY');
      expect(result.sql).toContain('LIMIT ? OFFSET ?');
      expect(result.params).toEqual([20, 0]); // Default limit=20, page=1
    });

    it('should apply custom page and limit', () => {
      const baseSql = 'SELECT * FROM users';
      const result = applyPagination(baseSql, { page: 3, limit: 10 });
      
      expect(result.params).toEqual([10, 20]); // limit=10, offset=(3-1)*10=20
    });

    it('should apply sort options', () => {
      const baseSql = 'SELECT * FROM users';
      const result = applyPagination(baseSql, {
        sortBy: 'created_at',
        sortOrder: 'asc',
      });
      
      expect(result.sql).toContain('ORDER BY created_at ASC');
    });

    it('should handle base SQL with WHERE clause', () => {
      const baseSql = 'SELECT * FROM users WHERE active = 1';
      const result = applyPagination(baseSql, { page: 2, limit: 50 });
      
      expect(result.sql).toContain('WHERE active = 1');
      expect(result.sql).toContain('LIMIT ? OFFSET ?');
      expect(result.params).toEqual([50, 50]);
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination metadata correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const result = calculatePagination(data, 1, 10, 45);
      
      expect(result.data).toEqual(data);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 45,
        totalPages: 5, // ceil(45/10) = 5
      });
    });

    it('should handle empty data', () => {
      const result = calculatePagination([], 1, 10, 0);
      
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should round up totalPages', () => {
      const result = calculatePagination([1, 2, 3], 1, 10, 25);
      
      expect(result.pagination.totalPages).toBe(3); // ceil(25/10) = 3
    });
  });
});

describe('Database Utilities - Where Clause Builder', () => {
  it('should build WHERE clause with filters', () => {
    const result = buildWhereClause({
      user_id: '123',
      status: 'active',
    });
    
    expect(result.where).toContain('WHERE user_id = ? AND status = ?');
    expect(result.params).toEqual(['123', 'active']);
  });

  it('should handle empty filters', () => {
    const result = buildWhereClause({});
    
    expect(result.where).toBe('');
    expect(result.params).toEqual([]);
  });

  it('should skip undefined values', () => {
    const result = buildWhereClause({
      user_id: '123',
      status: undefined,
      active: null,
    });
    
    expect(result.where).toBe('WHERE user_id = ?');
    expect(result.params).toEqual(['123']);
  });

  it('should handle multiple filters', () => {
    const result = buildWhereClause({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
    
    expect(result.where).toContain('a = ?');
    expect(result.where).toContain('b = ?');
    expect(result.where).toContain('c = ?');
    expect(result.where).toContain('d = ?');
    expect(result.params).toEqual([1, 2, 3, 4]);
  });
});

describe('Database Utilities - Type Guards', () => {
  describe('isValidHumidorType', () => {
    it('should accept valid types', () => {
      expect(isValidHumidorType('cabinet')).toBe(true);
      expect(isValidHumidorType('cooler')).toBe(true);
      expect(isValidHumidorType('desktop')).toBe(true);
      expect(isValidHumidorType('travel')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidHumidorType('invalid')).toBe(false);
      expect(isValidHumidorType('')).toBe(false);
      expect(isValidHumidorType('Cabinet')).toBe(false); // Case sensitive
    });
  });

  describe('isValidCigarStrength', () => {
    it('should accept valid strengths', () => {
      expect(isValidCigarStrength('mild')).toBe(true);
      expect(isValidCigarStrength('medium')).toBe(true);
      expect(isValidCigarStrength('full')).toBe(true);
    });

    it('should reject invalid strengths', () => {
      expect(isValidCigarStrength('light')).toBe(false);
      expect(isValidCigarStrength('strong')).toBe(false);
    });
  });

  describe('isValidSmokingStatus', () => {
    it('should accept valid statuses', () => {
      expect(isValidSmokingStatus('unsmoked')).toBe(true);
      expect(isValidSmokingStatus('partial')).toBe(true);
      expect(isValidSmokingStatus('finished')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isValidSmokingStatus('smoked')).toBe(false);
      expect(isValidSmokingStatus('open')).toBe(false);
    });
  });

  describe('isValidLogSource', () => {
    it('should accept valid sources', () => {
      expect(isValidLogSource('manual')).toBe(true);
      expect(isValidLogSource('sensor')).toBe(true);
      expect(isValidLogSource('iot')).toBe(true);
    });

    it('should reject invalid sources', () => {
      expect(isValidLogSource('automatic')).toBe(false);
      expect(isValidLogSource('device')).toBe(false);
    });
  });

  describe('isValidReminderType', () => {
    it('should accept valid types', () => {
      expect(isValidReminderType('check')).toBe(true);
      expect(isValidReminderType('smoke')).toBe(true);
      expect(isValidReminderType('rotate')).toBe(true);
      expect(isValidReminderType('hydrate')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidReminderType('water')).toBe(false);
      expect(isValidReminderType('maintain')).toBe(false);
    });
  });
});
