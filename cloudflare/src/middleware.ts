/**
 * CigarAtlas Middleware Utilities
 */

import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { AppError, UnauthorizedError } from './errors';
import type { Env, JwtPayload } from './types';
import { validateWithZod } from './errors';
import { PaginationSchema } from './validation';

// ============================================================================
// Rate Limiter (Simple in-memory for single worker)
// Note: For production, use Cloudflare Rate Limiting or KV store
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function rateLimiter(c: Context<{ Bindings: Env }>, next: Next) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // per minute
  
  const record = rateLimitMap.get(ip);
  
  if (record && now < record.resetTime) {
    if (record.count >= maxRequests) {
      throw new AppError('RATE_LIMITED', 'Too many requests', 429);
    }
    record.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  }
  
  await next();
}

// ============================================================================
// Authentication Middleware
// ============================================================================

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const token = getCookie(c, 'auth_token') || c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }
  
  try {
    // In production, verify JWT properly
    const payload = JSON.parse(atob(token)) as JwtPayload;
    
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    
    if (payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedError('Token expired');
    }
    
    // Attach user_id to context
    c.set('userId' as never, payload.sub);
  } catch {
    throw new UnauthorizedError('Invalid token');
  }
  
  await next();
}

// ============================================================================
// Get Current User ID
// ============================================================================

export function getUserId(c: Context): string {
  const userId = c.get('userId');
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }
  return userId;
}

// ============================================================================
// Pagination Helper
// ============================================================================

export function getPagination(c: Context) {
  const query = c.req.query();
  return validateWithZod(PaginationSchema, query);
}

// ============================================================================
// CORS Configuration
// ============================================================================

export function getCorsOrigins(env?: string): string | string[] {
  const environment = env || 'development';
  
  if (environment === 'production') {
    // Replace with actual production domains
    return [
      'https://cigaratlas.app',
      'https://www.cigaratlas.app',
    ];
  }
  
  // Development allowlist
  return [
    'http://localhost:3000',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
  ];
}

export function isOriginAllowed(origin: string, allowedOrigins: string | string[]): boolean {
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }
  return allowedOrigins === '*' || allowedOrigins === origin;
}