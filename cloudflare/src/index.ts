/**
 * CigarAtlas API - Cloudflare Workers Entry Point
 * Version: 1.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';
import type { Env, ApiResponse } from './types';
import { getCorsOrigins } from './middleware';
import { 
  AppError, 
  ValidationError,
  handleD1Error,
  validateWithZod 
} from './errors';
import {
  AppleSignInSchema,
  CreateHumidorSchema,
  UpdateHumidorSchema,
  CreateCigarSchema,
  UpdateCigarSchema,
  CreateEnvironmentLogSchema,
  CreateReminderSchema,
  UpdateReminderSchema,
} from './validation';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Helper to return 501 Not Implemented responses
function notImplemented(message: string): ApiResponse {
  return {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message,
    },
  };
}

// ============================================================================
// Global Middleware
// ============================================================================

app.use('*', logger());
app.use('*', compress());
app.use('*', secureHeaders());

// Enhanced CORS with proper origin validation
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = getCorsOrigins();
    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    }
    return allowedOrigins === '*' ? origin : allowedOrigins;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// ============================================================================
// Health Check Endpoints
// ============================================================================

app.get('/', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      name: 'CigarAtlas API',
      version: '1.0.0',
      environment: c.env?.ENVIRONMENT || 'test',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/health', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
  });
});

app.get('/v1', (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      version: 'v1',
      endpoints: {
        auth: '/v1/auth',
        users: '/v1/users',
        humidors: '/v1/humidors',
        cigars: '/v1/cigars',
        logs: '/v1/logs',
        reminders: '/v1/reminders',
      },
    },
  });
});

// ============================================================================
// Auth Routes
// ============================================================================

app.post('/v1/auth/apple', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(AppleSignInSchema, body, 'Invalid Apple Sign In data');
    
    // TODO: Implement actual Apple Sign In verification
    return c.json(notImplemented('Apple Sign In not yet implemented'), 501);
  } catch (e) {
    if (e instanceof AppError) {
      return c.json<ApiResponse>(e.toResponse(), e.statusCode as any);
    }
    throw e;
  }
});

app.post('/v1/auth/refresh', async (c) => {
  return c.json(notImplemented('Token refresh not yet implemented'), 501);
});

app.post('/v1/auth/logout', async (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

// ============================================================================
// User Routes
// ============================================================================

app.get('/v1/users/me', async (c) => {
  return c.json(notImplemented('Get user profile not yet implemented'), 501);
});

app.patch('/v1/users/me', async (c) => {
  return c.json(notImplemented('Update user profile not yet implemented'), 501);
});

// ============================================================================
// Humidor Routes
// ============================================================================

app.get('/v1/humidors', async (c) => {
  return c.json(notImplemented('List humidors not yet implemented'), 501);
});

app.post('/v1/humidors', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(CreateHumidorSchema, body, 'Invalid humidor data');
    
    // TODO: Implement with database insert
    return c.json(notImplemented('Create humidor not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.get('/v1/humidors/:id', async (c) => {
  // Route parameter captured but endpoint not implemented yet
  return c.json(notImplemented('Get humidor not yet implemented'), 501);
});

app.put('/v1/humidors/:id', async (c) => {
  // Route parameter captured but endpoint not implemented yet
  try {
    const body = await c.req.json();
    validateWithZod(UpdateHumidorSchema, body, 'Invalid humidor data');
    
    return c.json(notImplemented('Update humidor not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.delete('/v1/humidors/:id', async (c) => {
  return c.json(notImplemented('Delete humidor not yet implemented'), 501);
});

// ============================================================================
// Cigar Routes
// ============================================================================

app.get('/v1/humidors/:humidorId/cigars', async (c) => {
  return c.json(notImplemented('List cigars not yet implemented'), 501);
});

app.post('/v1/humidors/:humidorId/cigars', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(CreateCigarSchema, body, 'Invalid cigar data');
    
    return c.json(notImplemented('Create cigar not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.get('/v1/cigars/:id', async (c) => {
  return c.json(notImplemented('Get cigar not yet implemented'), 501);
});

app.put('/v1/cigars/:id', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(UpdateCigarSchema, body, 'Invalid cigar data');
    
    return c.json(notImplemented('Update cigar not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.delete('/v1/cigars/:id', async (c) => {
  return c.json(notImplemented('Delete cigar not yet implemented'), 501);
});

// ============================================================================
// Environment Log Routes
// ============================================================================

app.get('/v1/humidors/:humidorId/logs', async (c) => {
  return c.json(notImplemented('List environment logs not yet implemented'), 501);
});

app.post('/v1/humidors/:humidorId/logs', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(CreateEnvironmentLogSchema, body, 'Invalid log data');
    
    return c.json(notImplemented('Create environment log not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.get('/v1/humidors/:humidorId/logs/stats', async (c) => {
  return c.json(notImplemented('Environment statistics not yet implemented'), 501);
});

// ============================================================================
// Reminder Routes
// ============================================================================

app.get('/v1/humidors/:humidorId/reminders', async (c) => {
  return c.json(notImplemented('List reminders not yet implemented'), 501);
});

app.post('/v1/humidors/:humidorId/reminders', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(CreateReminderSchema, body, 'Invalid reminder data');
    
    return c.json(notImplemented('Create reminder not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.put('/v1/reminders/:id', async (c) => {
  try {
    const body = await c.req.json();
    validateWithZod(UpdateReminderSchema, body, 'Invalid reminder data');
    
    return c.json(notImplemented('Update reminder not yet implemented'), 501);
  } catch (e) {
    if (e instanceof ValidationError) {
      return c.json<ApiResponse>(e.toResponse(), 400);
    }
    throw e;
  }
});

app.delete('/v1/reminders/:id', async (c) => {
  return c.json(notImplemented('Delete reminder not yet implemented'), 501);
});

// ============================================================================
// Image Upload Routes (R2)
// ============================================================================

app.post('/v1/images/upload', async (c) => {
  return c.json(notImplemented('Image upload not yet implemented'), 501);
});

app.get('/v1/images/:key', async (c) => {
  return c.json(notImplemented('Image retrieval not yet implemented'), 501);
});

// ============================================================================
// Error Handling
// ============================================================================

app.notFound((c) => {
  return c.json<ApiResponse>({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${c.req.path} not found`,
    },
  }, 404);
});

app.onError((err, c) => {
  console.error('Server error:', err);
  
  // Handle known app errors
  if (err instanceof AppError) {
    return c.json<ApiResponse>(err.toResponse(), err.statusCode as any);
  }
  
  // Handle D1 database errors
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String(err.message);
    if (message.includes('D1') || message.includes('database')) {
      const dbError = handleD1Error(err);
      return c.json<ApiResponse>(dbError.toResponse(), dbError.statusCode as any);
    }
  }
  
  // Generic internal error
  return c.json<ApiResponse>({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
  }, 500);
});

// ============================================================================
// Export
// ============================================================================

export default app;