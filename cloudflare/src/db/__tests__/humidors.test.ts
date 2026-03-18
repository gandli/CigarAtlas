/**
 * Humidor Database Operations Tests
 * Tests for CRUD operations on humidors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import type { Humidor } from '../../types';

// Import database functions
import {
  createHumidor,
  getHumidorById,
  getHumidorsByUserId,
  getHumidorsByIds,
  getDefaultHumidor,
  getHumidorCount,
  updateHumidor,
  deleteHumidor,
  deleteHumidors,
  type CreateHumidorInput,
  type UpdateHumidorInput,
} from '../humidors';

describe('Humidor Database Operations', () => {
  let mockDb: D1Database;
  let mockStmt: any;
  let testUserId: string;
  let testHumidorId: string;

  beforeEach(() => {
    testUserId = 'user-123';
    testHumidorId = 'humidor-456';
    
    // Mock D1Database
    mockStmt = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn(),
      first: vi.fn(),
      all: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn().mockReturnValue(mockStmt),
    } as unknown as D1Database;

    vi.clearAllMocks();
  });

  describe('createHumidor', () => {
    it('should create a humidor with all fields', async () => {
      const input: CreateHumidorInput = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'My Humidor',
        type: 'cabinet',
        description: 'Test humidor',
        target_temperature_min: 16.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: 'https://example.com/image.jpg',
        capacity: 100,
        is_default: 1,
      };

      mockStmt.run.mockResolvedValue({ success: true });

      const result = await createHumidor(mockDb, input);

      expect(result.id).toBe(testHumidorId);
      expect(result.user_id).toBe(testUserId);
      expect(result.name).toBe('My Humidor');
      expect(result.type).toBe('cabinet');
      expect(mockDb.prepare).toHaveBeenCalled();
      expect(mockStmt.bind).toHaveBeenCalled();
    });

    it('should create a humidor with default values', async () => {
      const input: CreateHumidorInput = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Basic Humidor',
        type: 'desktop',
      };

      mockStmt.run.mockResolvedValue({ success: true });

      const result = await createHumidor(mockDb, input);

      expect(result.target_temperature_min).toBe(16.0);
      expect(result.target_temperature_max).toBe(18.0);
      expect(result.target_humidity_min).toBe(65.0);
      expect(result.target_humidity_max).toBe(70.0);
      expect(result.description).toBeNull();
      expect(result.image_url).toBeNull();
      expect(result.capacity).toBeNull();
      expect(result.is_default).toBe(0);
    });

    it('should throw error on database failure', async () => {
      const input: CreateHumidorInput = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Test',
        type: 'cabinet',
      };

      mockStmt.run.mockResolvedValue({ success: false, error: 'Database error' });

      await expect(createHumidor(mockDb, input)).rejects.toThrow('Failed to create humidor');
    });
  });

  describe('getHumidorById', () => {
    it('should return humidor when found', async () => {
      const mockHumidor: Humidor = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Test Humidor',
        type: 'cabinet',
        description: null,
        target_temperature_min: 16.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: null,
        capacity: null,
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStmt.first.mockResolvedValue(mockHumidor);

      const result = await getHumidorById(mockDb, testHumidorId);

      expect(result).toEqual(mockHumidor);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM humidors WHERE id = ?');
      expect(mockStmt.bind).toHaveBeenCalledWith(testHumidorId);
    });

    it('should return null when not found', async () => {
      mockStmt.first.mockResolvedValue(null);

      const result = await getHumidorById(mockDb, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getHumidorsByUserId', () => {
    it('should return all humidors for a user', async () => {
      const mockHumidors: Humidor[] = [
        {
          id: 'h1',
          user_id: testUserId,
          name: 'Humidor 1',
          type: 'cabinet',
          description: null,
          target_temperature_min: 16.0,
          target_temperature_max: 18.0,
          target_humidity_min: 65.0,
          target_humidity_max: 70.0,
          image_url: null,
          capacity: null,
          is_default: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'h2',
          user_id: testUserId,
          name: 'Humidor 2',
          type: 'cooler',
          description: null,
          target_temperature_min: 16.0,
          target_temperature_max: 18.0,
          target_humidity_min: 65.0,
          target_humidity_max: 70.0,
          image_url: null,
          capacity: null,
          is_default: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockStmt.all.mockResolvedValue({ results: mockHumidors });

      const result = await getHumidorsByUserId(mockDb, testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].is_default).toBe(1); // Default comes first
      expect(mockStmt.bind).toHaveBeenCalledWith(testUserId);
    });

    it('should return empty array when no humidors found', async () => {
      mockStmt.all.mockResolvedValue({ results: [] });

      const result = await getHumidorsByUserId(mockDb, testUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getHumidorsByIds', () => {
    it('should return humidors for given IDs', async () => {
      const ids = ['h1', 'h2', 'h3'];
      const mockHumidors: Humidor[] = ids.map(id => ({
        id,
        user_id: testUserId,
        name: `Humidor ${id}`,
        type: 'cabinet',
        description: null,
        target_temperature_min: 16.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: null,
        capacity: null,
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      mockStmt.all.mockResolvedValue({ results: mockHumidors });

      const result = await getHumidorsByIds(mockDb, ids);

      expect(result).toHaveLength(3);
    });

    it('should return empty array for empty ID list', async () => {
      const result = await getHumidorsByIds(mockDb, []);
      expect(result).toEqual([]);
      expect(mockDb.prepare).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultHumidor', () => {
    it('should return default humidor for user', async () => {
      const mockHumidor: Humidor = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Default Humidor',
        type: 'cabinet',
        description: null,
        target_temperature_min: 16.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: null,
        capacity: null,
        is_default: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStmt.first.mockResolvedValue(mockHumidor);

      const result = await getDefaultHumidor(mockDb, testUserId);

      expect(result).toEqual(mockHumidor);
      expect(mockStmt.bind).toHaveBeenCalledWith(testUserId);
    });

    it('should return null when no default humidor', async () => {
      mockStmt.first.mockResolvedValue(null);

      const result = await getDefaultHumidor(mockDb, testUserId);

      expect(result).toBeNull();
    });
  });

  describe('getHumidorCount', () => {
    it('should return count of humidors for user', async () => {
      mockStmt.first.mockResolvedValue({ count: 5 });

      const result = await getHumidorCount(mockDb, testUserId);

      expect(result).toBe(5);
    });

    it('should return 0 when no humidors', async () => {
      mockStmt.first.mockResolvedValue({ count: 0 });

      const result = await getHumidorCount(mockDb, testUserId);

      expect(result).toBe(0);
    });

    it('should return 0 on null result', async () => {
      mockStmt.first.mockResolvedValue(null);

      const result = await getHumidorCount(mockDb, testUserId);

      expect(result).toBe(0);
    });
  });

  describe('updateHumidor', () => {
    it('should update humidor fields', async () => {
      const updateInput: UpdateHumidorInput = {
        name: 'Updated Name',
        target_temperature_min: 17.0,
      };

      const mockHumidor: Humidor = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Updated Name',
        type: 'cabinet',
        description: null,
        target_temperature_min: 17.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: null,
        capacity: null,
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStmt.run.mockResolvedValue({ success: true });
      mockStmt.first.mockResolvedValue(mockHumidor);

      const result = await updateHumidor(mockDb, testHumidorId, updateInput);

      expect(result).toEqual(mockHumidor);
      expect(mockStmt.run).toHaveBeenCalled();
    });

    it('should return unchanged humidor when no fields to update', async () => {
      const mockHumidor: Humidor = {
        id: testHumidorId,
        user_id: testUserId,
        name: 'Original Name',
        type: 'cabinet',
        description: null,
        target_temperature_min: 16.0,
        target_temperature_max: 18.0,
        target_humidity_min: 65.0,
        target_humidity_max: 70.0,
        image_url: null,
        capacity: null,
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockStmt.first.mockResolvedValue(mockHumidor);

      const result = await updateHumidor(mockDb, testHumidorId, {});

      expect(result).toEqual(mockHumidor);
      expect(mockStmt.run).not.toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      mockStmt.run.mockResolvedValue({ success: false, error: 'Update failed' });

      await expect(
        updateHumidor(mockDb, testHumidorId, { name: 'Test' })
      ).rejects.toThrow('Failed to update humidor');
    });

    it('should update all available fields', async () => {
      const updateInput: UpdateHumidorInput = {
        name: 'New Name',
        type: 'cooler',
        description: 'New description',
        target_temperature_min: 15.0,
        target_temperature_max: 20.0,
        target_humidity_min: 60.0,
        target_humidity_max: 75.0,
        image_url: 'https://example.com/new.jpg',
        capacity: 200,
        is_default: 1,
      };

      mockStmt.run.mockResolvedValue({ success: true });
      mockStmt.first.mockResolvedValue({} as Humidor);

      await updateHumidor(mockDb, testHumidorId, updateInput);

      expect(mockStmt.run).toHaveBeenCalled();
    });
  });

  describe('deleteHumidor', () => {
    it('should delete humidor successfully', async () => {
      mockStmt.run.mockResolvedValue({ success: true, meta: { changes: 1 } });

      const result = await deleteHumidor(mockDb, testHumidorId);

      expect(result).toBe(true);
      expect(mockStmt.bind).toHaveBeenCalledWith(testHumidorId);
    });

    it('should return false when humidor not found', async () => {
      mockStmt.run.mockResolvedValue({ success: true, meta: { changes: 0 } });

      const result = await deleteHumidor(mockDb, 'non-existent');

      expect(result).toBe(false);
    });

    it('should return false on delete failure', async () => {
      mockStmt.run.mockResolvedValue({ success: false });

      const result = await deleteHumidor(mockDb, testHumidorId);

      expect(result).toBe(false);
    });
  });

  describe('deleteHumidors', () => {
    it('should delete multiple humidors', async () => {
      const ids = ['h1', 'h2', 'h3'];
      mockStmt.run.mockResolvedValue({ success: true, meta: { changes: 3 } });

      const result = await deleteHumidors(mockDb, ids);

      expect(result).toBe(3);
    });

    it('should return 0 for empty ID list', async () => {
      const result = await deleteHumidors(mockDb, []);
      expect(result).toBe(0);
      expect(mockDb.prepare).not.toHaveBeenCalled();
    });

    it('should return partial count if not all deleted', async () => {
      const ids = ['h1', 'h2', 'h3'];
      mockStmt.run.mockResolvedValue({ success: true, meta: { changes: 2 } });

      const result = await deleteHumidors(mockDb, ids);

      expect(result).toBe(2);
    });
  });
});
