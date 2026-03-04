/**
 * Humidor Statistics and Analytics
 * Performance-optimized queries for humidor data
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { HumidorSummary, EnvironmentStats } from '../types';

// ============================================================================
// Humidor Summary
// ============================================================================

/**
 * Get summary for a humidor (cigar count, latest environment reading)
 * Optimized with a single query using JOINs
 */
export async function getHumidorSummary(
  db: D1Database,
  humidorId: string
): Promise<HumidorSummary | null> {
  const query = `
    SELECT 
      h.*,
      COUNT(DISTINCT c.id) as cigar_count,
      COALESCE(SUM(c.quantity), 0) as total_quantity,
      (
        SELECT temperature 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_temperature,
      (
        SELECT humidity 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_humidity,
      (
        SELECT logged_at 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_log_at
    FROM humidors h
    LEFT JOIN cigars c ON c.humidor_id = h.id
    WHERE h.id = ?
    GROUP BY h.id
  `;

  const result = await db.prepare(query).bind(humidorId).first<HumidorSummary>();
  return result ?? null;
}

/**
 * Get summaries for all of a user's humidors
 * Batch optimized query
 */
export async function getUserHumidorSummaries(
  db: D1Database,
  userId: string
): Promise<HumidorSummary[]> {
  const query = `
    SELECT 
      h.*,
      COUNT(DISTINCT c.id) as cigar_count,
      COALESCE(SUM(c.quantity), 0) as total_quantity,
      (
        SELECT temperature 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_temperature,
      (
        SELECT humidity 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_humidity,
      (
        SELECT logged_at 
        FROM environment_logs 
        WHERE humidor_id = h.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      ) as latest_log_at
    FROM humidors h
    LEFT JOIN cigars c ON c.humidor_id = h.id
    WHERE h.user_id = ?
    GROUP BY h.id
    ORDER BY h.is_default DESC, h.created_at ASC
  `;

  const result = await db.prepare(query).bind(userId).all<HumidorSummary>();
  return result.results ?? [];
}

// ============================================================================
// Environment Statistics
// ============================================================================

export interface EnvironmentStatsOptions {
  days?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get environment statistics for a humidor
 * Optimized with indexed queries
 */
export async function getEnvironmentStats(
  db: D1Database,
  humidorId: string,
  options: EnvironmentStatsOptions = {}
): Promise<EnvironmentStats | null> {
  const { days = 30 } = options;
  
  let dateFilter = '';
  let params: unknown[] = [humidorId];
  
  if (options.startDate && options.endDate) {
    dateFilter = 'AND logged_at BETWEEN ? AND ?';
    params = [humidorId, options.startDate, options.endDate];
  } else {
    dateFilter = `AND logged_at >= datetime('now', '-${days} days')`;
  }

  const query = `
    SELECT 
      humidor_id,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      MIN(temperature) as min_temperature,
      MAX(temperature) as max_temperature,
      MIN(humidity) as min_humidity,
      MAX(humidity) as max_humidity,
      COUNT(*) as readings_count,
      MIN(logged_at) as period_start,
      MAX(logged_at) as period_end
    FROM environment_logs
    WHERE humidor_id = ? ${dateFilter}
    GROUP BY humidor_id
  `;

  const result = await db.prepare(query).bind(...params).first<EnvironmentStats>();
  return result ?? null;
}

/**
 * Get environment statistics for multiple humidors (batch)
 */
export async function getEnvironmentStatsBatch(
  db: D1Database,
  humidorIds: string[],
  options: EnvironmentStatsOptions = {}
): Promise<Map<string, EnvironmentStats>> {
  if (humidorIds.length === 0) {
    return new Map();
  }

  const { days = 30 } = options;
  const dateFilter = `AND logged_at >= datetime('now', '-${days} days')`;
  
  const placeholders = humidorIds.map(() => '?').join(',');
  const query = `
    SELECT 
      humidor_id,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      MIN(temperature) as min_temperature,
      MAX(temperature) as max_temperature,
      MIN(humidity) as min_humidity,
      MAX(humidity) as max_humidity,
      COUNT(*) as readings_count,
      MIN(logged_at) as period_start,
      MAX(logged_at) as period_end
    FROM environment_logs
    WHERE humidor_id IN (${placeholders}) ${dateFilter}
    GROUP BY humidor_id
  `;

  const result = await db.prepare(query).bind(...humidorIds).all<EnvironmentStats>();
  
  const statsMap = new Map<string, EnvironmentStats>();
  for (const stat of result.results ?? []) {
    statsMap.set(stat.humidor_id, stat);
  }
  
  return statsMap;
}

// ============================================================================
// Trend Analysis
// ============================================================================

export interface EnvironmentTrend {
  humidor_id: string;
  period: string;
  avg_temperature: number;
  avg_humidity: number;
  readings_count: number;
}

/**
 * Get daily environment trends for the past N days
 */
export async function getEnvironmentTrends(
  db: D1Database,
  humidorId: string,
  days: number = 30
): Promise<EnvironmentTrend[]> {
  const query = `
    SELECT 
      humidor_id,
      DATE(logged_at) as period,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      COUNT(*) as readings_count
    FROM environment_logs
    WHERE humidor_id = ?
      AND logged_at >= datetime('now', '-${days} days')
    GROUP BY humidor_id, DATE(logged_at)
    ORDER BY period ASC
  `;

  const result = await db.prepare(query).bind(humidorId).all<EnvironmentTrend>();
  return result.results ?? [];
}

/**
 * Get hourly environment trends for the past 24 hours
 * Useful for real-time monitoring dashboards
 */
export async function getHourlyEnvironmentTrends(
  db: D1Database,
  humidorId: string,
  hours: number = 24
): Promise<EnvironmentTrend[]> {
  const query = `
    SELECT 
      humidor_id,
      strftime('%Y-%m-%d %H:00', logged_at) as period,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      COUNT(*) as readings_count
    FROM environment_logs
    WHERE humidor_id = ?
      AND logged_at >= datetime('now', '-${hours} hours')
    GROUP BY humidor_id, strftime('%Y-%m-%d %H:00', logged_at)
    ORDER BY period ASC
  `;

  const result = await db.prepare(query).bind(humidorId).all<EnvironmentTrend>();
  return result.results ?? [];
}

// ============================================================================
// Alert Detection
// ============================================================================

export interface EnvironmentAlert {
  humidor_id: string;
  alert_type: 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  value: number;
  threshold: number;
  logged_at: string;
}

/**
 * Get recent environment alerts (readings outside target range)
 */
export async function getEnvironmentAlerts(
  db: D1Database,
  humidorId: string,
  hours: number = 24
): Promise<EnvironmentAlert[]> {
  const query = `
    SELECT 
      l.humidor_id,
      CASE 
        WHEN l.temperature > h.target_temperature_max THEN 'temperature_high'
        WHEN l.temperature < h.target_temperature_min THEN 'temperature_low'
        WHEN l.humidity > h.target_humidity_max THEN 'humidity_high'
        WHEN l.humidity < h.target_humidity_min THEN 'humidity_low'
      END as alert_type,
      CASE 
        WHEN l.temperature > h.target_temperature_max THEN l.temperature
        WHEN l.temperature < h.target_temperature_min THEN l.temperature
        WHEN l.humidity > h.target_humidity_max THEN l.humidity
        WHEN l.humidity < h.target_humidity_min THEN l.humidity
      END as value,
      CASE 
        WHEN l.temperature > h.target_temperature_max THEN h.target_temperature_max
        WHEN l.temperature < h.target_temperature_min THEN h.target_temperature_min
        WHEN l.humidity > h.target_humidity_max THEN h.target_humidity_max
        WHEN l.humidity < h.target_humidity_min THEN h.target_humidity_min
      END as threshold,
      l.logged_at
    FROM environment_logs l
    JOIN humidors h ON h.id = l.humidor_id
    WHERE l.humidor_id = ?
      AND l.logged_at >= datetime('now', '-${hours} hours')
      AND (
        l.temperature > h.target_temperature_max
        OR l.temperature < h.target_temperature_min
        OR l.humidity > h.target_humidity_max
        OR l.humidity < h.target_humidity_min
      )
    ORDER BY l.logged_at DESC
  `;

  const result = await db.prepare(query).bind(humidorId).all<EnvironmentAlert>();
  return result.results ?? [];
}
