/**
 * Authentication Middleware
 * JWT-based authentication for CigarAtlas API
 */

import type { Context, MiddlewareHandler } from 'hono';
import type { Env, User } from '../types';
import { getUserByAppleId, createUser, getUserById } from '../db/users';
import { verifyAccessToken, extractToken } from '../utils/jwt';

// ============================================================================
// Context Variables
// ============================================================================

type Variables = {
  userId: string;
  user?: User;
};

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user ID to context
 */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);
  
  // For development/testing, allow bypassing auth with special header
  if (c.env.ENVIRONMENT === 'development' && c.req.header('X-Dev-User-Id')) {
    c.set('userId', c.req.header('X-Dev-User-Id')!);
    await next();
    return;
  }
  
  if (!token) {
    c.res = c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header. Use: Bearer <token>',
      },
    }, 401);
    return;
  }
  
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured in environment');
    c.res = c.json({
      success: false,
      error: {
        code: 'CONFIGURATION_ERROR',
        message: 'Server configuration error. Please contact support.',
      },
    }, 500);
    return;
  }
  
  // Verify the access token
  const payload = await verifyAccessToken(token, secret);
  if (!payload || !payload.sub) {
    c.res = c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      },
    }, 401);
    return;
  }
  
  // Attach user ID to context variables
  c.set('userId', payload.sub);
  
  await next();
};

/**
 * Optional authentication middleware
 * Attaches user ID if token is present, but doesn't require it
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);
  
  if (token && c.env.JWT_SECRET) {
    const payload = await verifyAccessToken(token, c.env.JWT_SECRET);
    if (payload?.sub) {
      c.set('userId', payload.sub);
    }
  }
  
  await next();
};

// ============================================================================
// User Helpers
// ============================================================================

/**
 * Get current authenticated user
 * Throws error if user is not authenticated
 * 
 * @param c - Hono context
 * @returns Current user object
 */
export async function requireUser(c: Context<{ Bindings: Env; Variables: Variables }>): Promise<User> {
  const userId = c.get('userId');
  
  if (!userId) {
    throw new Error('User not authenticated. Please login first.');
  }
  
  // Check if user is already cached in context
  const cachedUser = c.get('user');
  if (cachedUser) {
    return cachedUser as User;
  }
  
  // For development, return a mock user if using dev bypass
  if (c.env.ENVIRONMENT === 'development') {
    // Use the same fixed dev user as in auth routes
    const devAppleId = 'dev_test_user';
    let user = await getUserByAppleId(c.env.DB, devAppleId);
    if (!user) {
      user = await createUser(c.env.DB, {
        id: userId,
        apple_id: devAppleId,
        nickname: 'Dev User',
        timezone: 'Asia/Shanghai',
      });
    }
    c.set('user', user);
    return user;
  }
  
  // In production, fetch user from database
  const user = await getUserById(c.env.DB, userId);
  if (!user) {
    throw new Error('User not found. Token may be invalid.');
  }
  
  c.set('user', user);
  return user;
}

/**
 * Get current user ID (without fetching full user object)
 * Returns null if not authenticated
 */
export function getCurrentUserId(c: Context<{ Bindings: Env; Variables: Variables }>): string | null {
  return c.get('userId') || null;
}

/**
 * Get current user or null if not authenticated
 */
export async function getCurrentUser(
  c: Context<{ Bindings: Env; Variables: Variables }>
): Promise<User | null> {
  const userId = getCurrentUserId(c);
  if (!userId) {
    return null;
  }
  
  // Check cache
  const cachedUser = c.get('user');
  if (cachedUser) {
    return cachedUser as User;
  }
  
  // Fetch from database
  const user = await getUserById(c.env.DB, userId);
  if (user) {
    c.set('user', user);
  }
  
  return user;
}

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiting middleware
 * For production, use Cloudflare's built-in rate limiting or Durable Objects
 * 
 * @param limit - Maximum requests per window
 * @param windowMs - Window size in milliseconds
 */
export function rateLimit(limit: number, windowMs: number): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c, next) => {
    const key = c.req.header('X-Forwarded-For') || c.req.header('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    
    const record = rateLimitMap.get(key);
    
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      record.count++;
      
      if (record.count > limit) {
        c.res = c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Limit: ${limit} per ${windowMs / 1000}s`,
          },
        }, 429);
        return;
      }
    }
    
    // Set rate limit headers
    const recordNow = rateLimitMap.get(key)!;
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, limit - recordNow.count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(recordNow.resetAt / 1000).toString());
    
    await next();
  };
}

// ============================================================================
// Permission Checks
// ============================================================================

/**
 * Check if current user owns a resource
 * 
 * @param c - Hono context
 * @param resourceUserId - ID of the user who owns the resource
 * @returns true if current user owns the resource
 */
export function checkOwnership(c: Context<{ Bindings: Env; Variables: Variables }>, resourceUserId: string): boolean {
  const currentUserId = getCurrentUserId(c);
  return currentUserId === resourceUserId;
}

/**
 * Require that current user owns a resource
 * Throws error if user doesn't own the resource
 * 
 * @param c - Hono context
 * @param resourceUserId - ID of the user who owns the resource
 */
export function requireOwnership(c: Context<{ Bindings: Env; Variables: Variables }>, resourceUserId: string): void {
  if (!checkOwnership(c, resourceUserId)) {
    throw new Error('You do not have permission to access this resource');
  }
}
