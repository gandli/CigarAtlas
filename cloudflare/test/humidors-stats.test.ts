/**
 * Humidor Statistics Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getHumidorSummary,
  getUserHumidorSummaries,
  getEnvironmentStats,
  getEnvironmentStatsBatch,
  getEnvironmentTrends,
  getHourlyEnvironmentTrends,
  getEnvironmentAlerts,
} from '../db/humidors-stats';

// Mock D1Database
const mockDb = {
  prepare: vi.fn(),
  batch: vi.fn(),
  exec: vi.fn(),
} as any;

describe('Humidor Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHumidorSummary', () => {
    it('should return humidor summary with counts', async () => {
      const mockSummary = {
        id: 'h1',
        name: 'Test Humidor',
        cigar_count: 5,
        total_quantity: 50,
        latest_temperature: 18.5,
        latest_humidity: 68,
        latest_log_at: '2026-03-05T01:00:00Z',
      };

      const mockFirst = vi.fn().mockResolvedValue(mockSummary);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorSummary(mockDb, 'h1');

      expect(result).toEqual(mockSummary);
      expect(mockBind).toHaveBeenCalledWith('h1');
    });

    it('should return null when humidor not found', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorSummary(mockDb, 'nonexistent');
      
      expect(result).toBeNull();
    });

    it('should handle humidors with no cigars', async () => {
      const mockSummary = {
        id: 'h1',
        name: 'Empty Humidor',
        cigar_count: 0,
        total_quantity: 0,
        latest_temperature: null,
        latest_humidity: null,
        latest_log_at: null,
      };

      const mockFirst = vi.fn().mockResolvedValue(mockSummary);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHumidorSummary(mockDb, 'h1');
      
      expect(result?.cigar_count).toBe(0);
      expect(result?.total_quantity).toBe(0);
    });
  });

  describe('getUserHumidorSummaries', () => {
    it('should return summaries for all user humidors', async () => {
      const mockSummaries = [
        { id: 'h1', name: 'Humidor 1', is_default: 1, cigar_count: 10 },
        { id: 'h2', name: 'Humidor 2', is_default: 0, cigar_count: 5 },
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockSummaries });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getUserHumidorSummaries(mockDb, 'user-123');

      expect(result).toEqual(mockSummaries);
      expect(mockBind).toHaveBeenCalledWith('user-123');
    });

    it('should order by is_default DESC, created_at ASC', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getUserHumidorSummaries(mockDb, 'user-123');

      const callArg = mockPrepare.mock.calls[0][0];
      expect(callArg).toContain('ORDER BY h.is_default DESC, h.created_at ASC');
    });

    it('should return empty array for user with no humidors', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getUserHumidorSummaries(mockDb, 'user-123');
      
      expect(result).toEqual([]);
    });
  });

  describe('getEnvironmentStats', () => {
    it('should return environment statistics', async () => {
      const mockStats = {
        humidor_id: 'h1',
        avg_temperature: 17.5,
        avg_humidity: 67,
        min_temperature: 16,
        max_temperature: 19,
        min_humidity: 65,
        max_humidity: 70,
        readings_count: 100,
        period_start: '2026-02-03T00:00:00Z',
        period_end: '2026-03-05T00:00:00Z',
      };

      const mockFirst = vi.fn().mockResolvedValue(mockStats);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentStats(mockDb, 'h1', { days: 30 });

      expect(result).toEqual(mockStats);
      expect(mockBind).toHaveBeenCalledWith('h1');
    });

    it('should use custom date range', async () => {
      const mockFirst = vi.fn().mockResolvedValue({});
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getEnvironmentStats(mockDb, 'h1', {
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-31T23:59:59Z',
      });

      // Verify date range parameters are passed
      expect(mockBind).toHaveBeenCalledWith(
        'h1',
        '2026-01-01T00:00:00Z',
        '2026-01-31T23:59:59Z'
      );
    });

    it('should return null when no data', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentStats(mockDb, 'h1');
      
      expect(result).toBeNull();
    });
  });

  describe('getEnvironmentStatsBatch', () => {
    it('should return stats for multiple humidors', async () => {
      const mockStats = [
        { humidor_id: 'h1', avg_temperature: 17.5 },
        { humidor_id: 'h2', avg_temperature: 18.0 },
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockStats });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentStatsBatch(mockDb, ['h1', 'h2']);

      expect(result.size).toBe(2);
      expect(result.get('h1')?.avg_temperature).toBe(17.5);
      expect(result.get('h2')?.avg_temperature).toBe(18.0);
    });

    it('should return empty map for empty input', async () => {
      const result = await getEnvironmentStatsBatch(mockDb, []);
      expect(result.size).toBe(0);
    });

    it('should handle missing stats for some humidors', async () => {
      const mockStats = [
        { humidor_id: 'h1', avg_temperature: 17.5 },
        // h2 has no data
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockStats });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentStatsBatch(mockDb, ['h1', 'h2']);

      expect(result.size).toBe(1);
      expect(result.has('h1')).toBe(true);
      expect(result.has('h2')).toBe(false);
    });
  });

  describe('getEnvironmentTrends', () => {
    it('should return daily trends', async () => {
      const mockTrends = [
        { period: '2026-03-01', avg_temperature: 17.5, avg_humidity: 67, readings_count: 24 },
        { period: '2026-03-02', avg_temperature: 17.8, avg_humidity: 68, readings_count: 24 },
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockTrends });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentTrends(mockDb, 'h1', 30);

      expect(result).toEqual(mockTrends);
      expect(result[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should order by period ASC', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getEnvironmentTrends(mockDb, 'h1', 30);

      const callArg = mockPrepare.mock.calls[0][0];
      expect(callArg).toContain('ORDER BY period ASC');
    });
  });

  describe('getHourlyEnvironmentTrends', () => {
    it('should return hourly trends', async () => {
      const mockTrends = [
        { period: '2026-03-04 20:00', avg_temperature: 17.5, readings_count: 4 },
        { period: '2026-03-04 21:00', avg_temperature: 17.6, readings_count: 4 },
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockTrends });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getHourlyEnvironmentTrends(mockDb, 'h1', 24);

      expect(result).toEqual(mockTrends);
      expect(result[0].period).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:00$/);
    });
  });

  describe('getEnvironmentAlerts', () => {
    it('should return alerts for out-of-range readings', async () => {
      const mockAlerts = [
        {
          humidor_id: 'h1',
          alert_type: 'temperature_high',
          value: 22,
          threshold: 18,
          logged_at: '2026-03-05T01:00:00Z',
        },
        {
          humidor_id: 'h1',
          alert_type: 'humidity_low',
          value: 60,
          threshold: 65,
          logged_at: '2026-03-05T00:30:00Z',
        },
      ];

      const mockAll = vi.fn().mockResolvedValue({ results: mockAlerts });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      const result = await getEnvironmentAlerts(mockDb, 'h1', 24);

      expect(result).toEqual(mockAlerts);
      expect(result[0].alert_type).toBe('temperature_high');
    });

    it('should detect all alert types', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getEnvironmentAlerts(mockDb, 'h1', 24);

      const callArg = mockPrepare.mock.calls[0][0];
      expect(callArg).toContain('temperature_high');
      expect(callArg).toContain('temperature_low');
      expect(callArg).toContain('humidity_high');
      expect(callArg).toContain('humidity_low');
    });

    it('should order by logged_at DESC', async () => {
      const mockAll = vi.fn().mockResolvedValue({ results: [] });
      const mockBind = vi.fn().mockReturnValue({ all: mockAll });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
      
      mockDb.prepare = mockPrepare;

      await getEnvironmentAlerts(mockDb, 'h1', 24);

      const callArg = mockPrepare.mock.calls[0][0];
      expect(callArg).toContain('ORDER BY l.logged_at DESC');
    });
  });
});
