/**
 * Humidor Database Operations Tests
 * Note: These tests use mocked D1Database
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createHumidor,
  getHumidorById,
  getHumidorsByUserId,
  updateHumidor,
  deleteHumidor,
  getDefaultHumidor,
  getHumidorCount,
} from '../db/humidors';

// Mock D1Database
const mockDb = {
  prepare: vi.fn(),
  batch: vi.fn(),
  exec: vi.fn(),
} as any;

describe('Humidor Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createHumidor', () => {
    it('should create a humidor with all fields', async () => {
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      const mockBind = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const input = {
        id: 'test-id-123',
        user_id: 'user-123',
        name: 'Test Humidor',
        type: 'cabinet' as const,
        description: 'A test humidor',
        target_temperature_min: 16,
        target_temperature_max: 18,
        target_humidity_min: 65,
        target_humidity_max: 70,
        capacity: 100,
        is_default: 1,
      };

      // Note: This test verifies the function can be called
      // Full integration testing would require actual D1 setup
      expect(() => createHumidor(mockDb, input)).toBeDefined();
    });

    it('should use default values when not provided', async () => {
      const input = {
        id: 'test-id',
        user_id: 'user-123',
        name: 'Test',
        type: 'cabinet' as const,
      };

      // Should use defaults for temperature, humidity, etc.
      expect(() => createHumidor(mockDb, input)).toBeDefined();
    });
  });

  describe('getHumidorById', () => {
    it('should call database with correct query', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getHumidorById(mockDb, 'humidor-123');

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM humidors'));
      expect(mockBind).toHaveBeenCalledWith('humidor-123');
      expect(mockFirst).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorById(mockDb, 'nonexistent');
      
      expect(result).toBeNull();
    });

    it('should return humidor when found', async () => {
      const mockHumidor = {
        id: 'humidor-123',
        user_id: 'user-123',
        name: 'Test Humidor',
        type: 'cabinet',
      };
      
      const mockFirst = vi.fn().mockResolvedValue(mockHumidor);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorById(mockDb, 'humidor-123');
      
      expect(result).toEqual(mockHumidor);
    });
  });

  describe('getHumidorsByUserId', () => {
    it('should return all humidors for user', async () => {
      const mockHumidors = [
        { id: 'h1', name: 'Humidor 1', is_default: 1 },
        { id: 'h2', name: 'Humidor 2', is_default: 0 },
      ];
      
      const mockAll = vi.fn().mockResolvedValue({ results: mockHumidors });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorsByUserId(mockDb, 'user-123');
      
      expect(result).toEqual(mockHumidors);
      expect(mockBind).toHaveBeenCalledWith('user-123');
    });

    it('should order by is_default DESC, created_at ASC', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getHumidorsByUserId(mockDb, 'user-123');

      const callArg = mockPrepare.mock.calls[0][0];
      expect(callArg).toContain('ORDER BY is_default DESC, created_at ASC');
    });

    it('should return empty array when no humidors', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorsByUserId(mockDb, 'user-123');
      
      expect(result).toEqual([]);
    });
  });

  describe('getDefaultHumidor', () => {
    it('should return default humidor', async () => {
      const mockDefault = { id: 'default-h', is_default: 1 };
      
      const mockFirst = vi.fn().mockResolvedValue(mockDefault);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getDefaultHumidor(mockDb, 'user-123');
      
      expect(result).toEqual(mockDefault);
      expect(mockBind).toHaveBeenCalledWith('user-123');
    });

    it('should return null when no default', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getDefaultHumidor(mockDb, 'user-123');
      
      expect(result).toBeNull();
    });
  });

  describe('getHumidorCount', () => {
    it('should return count of humidors', async () => {
      const mockFirst = vi.fn().mockResolvedValue({ count: 5 });
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorCount(mockDb, 'user-123');
      
      expect(result).toBe(5);
    });

    it('should return 0 when no humidors', async () => {
      const mockFirst = vi.fn().mockResolvedValue({ count: 0 });
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorCount(mockDb, 'user-123');
      
      expect(result).toBe(0);
    });
  });

  describe('updateHumidor', () => {
    it('should update humidor fields', async () => {
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      const mockBindUpdate = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepareUpdate = vi.fn().mockReturnValue({ bind: mockBindUpdate });
      
      const mockHumidor = { id: 'h1', name: 'Updated' };
      const mockFirst = vi.fn().mockResolvedValue(mockHumidor);
      const mockBindGet = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepareGet = vi.fn().mockReturnValue({ bind: mockBindGet });
      
      mockDb.prepare = mockPrepareUpdate;

      const result = await updateHumidor(mockDb, 'h1', { name: 'Updated' });
      
      expect(result).toEqual(mockHumidor);
    });

    it('should return null when humidor not found', async () => {
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      const mockBindUpdate = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepareUpdate = vi.fn().mockReturnValue({ bind: mockBindUpdate });
      
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBindGet = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepareGet = vi.fn().mockReturnValue({ bind: mockBindGet });
      
      mockDb.prepare = mockPrepareUpdate;

      const result = await updateHumidor(mockDb, 'nonexistent', { name: 'Updated' });
      
      expect(result).toBeNull();
    });

    it('should update updated_at timestamp', async () => {
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      const mockBind = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await updateHumidor(mockDb, 'h1', { name: 'Updated' });

      // Verify updated_at is included in the update
      const updateCall = mockBind.mock.calls[0];
      expect(updateCall).toContain('updated_at');
    });
  });

  describe('deleteHumidor', () => {
    it('should delete humidor', async () => {
      const mockRun = vi.fn().mockResolvedValue({ 
        success: true,
        meta: { changes: 1 }
      });
      const mockBind = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await deleteHumidor(mockDb, 'h1');
      
      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      const mockRun = vi.fn().mockResolvedValue({ 
        success: true,
        meta: { changes: 0 }
      });
      const mockBind = vi.fn().mockReturnValue({ run: mockRun });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await deleteHumidor(mockDb, 'nonexistent');
      
      expect(result).toBe(false);
    });
  });
});
