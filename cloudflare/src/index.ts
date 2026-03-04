/**
 * CigarAtlas API - Cloudflare Workers Entry Point
 * Version: 1.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, ApiResponse } from './types';

// Import routes
import humidorsRoutes from './routes/humidors';
import statsRoutes from './routes/stats';

// Create Hono app with custom context
type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Middleware
// ============================================================================

// Request logging
app.use('*', logger());

// CORS configuration
app.use('*', cors({
  origin: '*', // TODO: Configure properly for production
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
}));

// ============================================================================
// Health & Info Endpoints
// ============================================================================

/**
 * GET /
 * API info and health check
 */
app.get('/', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      name: 'CigarAtlas API',
      version: '1.0.0',
      environment: c.env?.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * GET /health
 * Health check endpoint with database connectivity check
 */
app.get('/health', async (c) => {
  // Check database connection
  let dbStatus = 'unknown';
  try {
    await c.env.DB.prepare('SELECT 1').first();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  return c.json<ApiResponse>({
    success: true,
    data: {
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * GET /v1
 * API version info
 */
app.get('/v1', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      version: 'v1',
      endpoints: {
        humidors: '/v1/humidors',
        stats: '/v1/humidors/:id/stats',
        cigars: '/v1/cigars',
        logs: '/v1/logs',
        reminders: '/v1/reminders',
        images: '/v1/images',
      },
      documentation: 'https://github.com/gandli/CigarAtlas',
    },
  });
});

// ============================================================================
// API Routes
// ============================================================================

// Humidor routes (authenticated)
app.route('/v1/humidors', humidorsRoutes);

// Statistics routes (authenticated)
app.route('/v1/humidors', statsRoutes);

// ============================================================================
// Placeholder Routes (To Be Implemented)
// ============================================================================

// Cigar routes
const cigars = new Hono<{ Bindings: Env }>();
cigars.use('/*', (c, next) => {
  // TODO: Add auth middleware
  return next();
});

cigars.get('/humidors/:humidorId/cigars', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'List cigars not yet implemented' },
}, 501));

cigars.post('/humidors/:humidorId/cigars', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Create cigar not yet implemented' },
}, 501));

cigars.get('/:id', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Get cigar not yet implemented' },
}, 501));

cigars.put('/:id', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Update cigar not yet implemented' },
}, 501));

cigars.delete('/:id', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Delete cigar not yet implemented' },
}, 501));

app.route('/v1', cigars);

// Environment Log routes
const logs = new Hono<{ Bindings: Env }>();

logs.get('/humidors/:humidorId/logs', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'List environment logs not yet implemented' },
}, 501));

logs.post('/humidors/:humidorId/logs', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Create environment log not yet implemented' },
}, 501));

logs.get('/humidors/:humidorId/logs/stats', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Environment statistics not yet implemented' },
}, 501));

app.route('/v1', logs);

// Reminder routes
const reminders = new Hono<{ Bindings: Env }>();

reminders.get('/humidors/:humidorId/reminders', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'List reminders not yet implemented' },
}, 501));

reminders.post('/humidors/:humidorId/reminders', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Create reminder not yet implemented' },
}, 501));

reminders.put('/reminders/:id', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Update reminder not yet implemented' },
}, 501));

reminders.delete('/reminders/:id', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Delete reminder not yet implemented' },
}, 501));

app.route('/v1', reminders);

// Image routes
const images = new Hono<{ Bindings: Env }>();

images.post('/images/upload', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Image upload not yet implemented' },
}, 501));

images.get('/images/:key', (c) => c.json<ApiResponse>({
  success: false,
  error: { code: 'NOT_IMPLEMENTED', message: 'Image retrieval not yet implemented' },
}, 501));

app.route('/v1', images);

// ============================================================================
// Error Handling
// ============================================================================

/**
 * 404 Not Found handler
 */
app.notFound((c) => {
  return c.json<ApiResponse>({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${c.req.method} ${c.req.path}`,
    },
  }, 404);
});

/**
 * Global error handler
 */
app.onError((err, c) => {
  console.error('Server error:', err);
  
  // Log request details for debugging
  console.error({
    method: c.req.method,
    path: c.req.path,
    headers: Object.fromEntries(c.req.raw.headers),
  });

  return c.json<ApiResponse>({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
  }, 500);
});

// Export for Cloudflare Workers
export default app;
