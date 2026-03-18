/**
 * Humidor Statistics Routes
 * Performance-optimized endpoints for humidor analytics
 */

import { Hono } from 'hono';
import type { Env, ApiResponse, EnvironmentStats, EnvironmentTrend, EnvironmentAlert } from '../types';
import { authMiddleware, requireUser } from '../middleware/auth';
import {
  getHumidorById,
  getEnvironmentStats,
  getEnvironmentTrends,
  getHourlyEnvironmentTrends,
  getEnvironmentAlerts,
} from '../db/index';

const stats = new Hono<{ Bindings: Env }>();

// All stats routes require authentication
stats.use('/*', authMiddleware);

/**
 * GET /v1/humidors/:id/stats
 * Get environment statistics for a humidor
 */
stats.get('/humidors/:id/stats', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

    // Verify humidor exists and user owns it
    const humidor = await getHumidorById(c.env.DB, humidorId);
    if (!humidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (humidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Parse query parameters
    const days = c.req.query('days') ? parseInt(c.req.query('days')!, 10) : 30;
    const startDate = c.req.query('startDate') || undefined;
    const endDate = c.req.query('endDate') || undefined;

    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Days parameter must be between 1 and 365',
        },
      }, 400);
    }

    const stats = await getEnvironmentStats(c.env.DB, humidorId, {
      days,
      startDate,
      endDate,
    });

    if (!stats) {
      return c.json<ApiResponse>({
        success: true,
        data: {
          humidor_id: humidorId,
          avg_temperature: null,
          avg_humidity: null,
          min_temperature: null,
          max_temperature: null,
          min_humidity: null,
          max_humidity: null,
          readings_count: 0,
          period_start: null,
          period_end: null,
        },
      });
    }

    return c.json<ApiResponse<EnvironmentStats>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get environment stats error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve environment statistics',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/:id/stats/trends
 * Get daily environment trends
 */
stats.get('/humidors/:id/stats/trends', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

    // Verify humidor exists and user owns it
    const humidor = await getHumidorById(c.env.DB, humidorId);
    if (!humidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (humidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Parse query parameters
    const days = c.req.query('days') ? parseInt(c.req.query('days')!, 10) : 30;

    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Days parameter must be between 1 and 365',
        },
      }, 400);
    }

    const trends = await getEnvironmentTrends(c.env.DB, humidorId, days);

    return c.json<ApiResponse<EnvironmentTrend[]>>({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Get environment trends error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve environment trends',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/:id/stats/trends/hourly
 * Get hourly environment trends for the past 24 hours
 */
stats.get('/humidors/:id/stats/trends/hourly', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

    // Verify humidor exists and user owns it
    const humidor = await getHumidorById(c.env.DB, humidorId);
    if (!humidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (humidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Parse query parameters
    const hours = c.req.query('hours') ? parseInt(c.req.query('hours')!, 10) : 24;

    // Validate hours parameter
    if (isNaN(hours) || hours < 1 || hours > 168) { // Max 1 week
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Hours parameter must be between 1 and 168',
        },
      }, 400);
    }

    const trends = await getHourlyEnvironmentTrends(c.env.DB, humidorId, hours);

    return c.json<ApiResponse<EnvironmentTrend[]>>({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Get hourly trends error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve hourly trends',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/:id/stats/alerts
 * Get recent environment alerts
 */
stats.get('/humidors/:id/stats/alerts', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

    // Verify humidor exists and user owns it
    const humidor = await getHumidorById(c.env.DB, humidorId);
    if (!humidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (humidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Parse query parameters
    const hours = c.req.query('hours') ? parseInt(c.req.query('hours')!, 10) : 24;

    // Validate hours parameter
    if (isNaN(hours) || hours < 1 || hours > 720) { // Max 30 days
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Hours parameter must be between 1 and 720',
        },
      }, 400);
    }

    const alerts = await getEnvironmentAlerts(c.env.DB, humidorId, hours);

    return c.json<ApiResponse<EnvironmentAlert[]>>({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Get environment alerts error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve environment alerts',
      },
    }, 500);
  }
});

export default stats;
