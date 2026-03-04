/**
 * Authentication Middleware
 * JWT-based authentication for CigarAtlas API
 */

import type { Context, MiddlewareHandler, Next } from 'hono';
import type { Env, User, JwtPayload } from '../types';
import { getUserByAppleId, createUser } from '../db/users';

type Variables = {
  userId: string;
};

// ============================================================================
// JWT Utilities (to be replaced with actual JWT library in production)
// ============================================================================

/**
 * Verify JWT token
 * In production, use a proper JWT library like @tsndr/cloudflare-worker-jwt
 */
async function verifyToken(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    // TODO: Implement proper JWT verification
    // For now, this is a placeholder
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode payload (base64url)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to context
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
        message: 'Missing or invalid authorization header',
      },
    }, 401);
    return;
  }
  
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    c.res = c.json({
      success: false,
      error: {
        code: 'CONFIGURATION_ERROR',
        message: 'Server configuration error',
      },
    }, 500);
    return;
  }
  
  const payload = await verifyToken(token, secret);
  if (!payload || !payload.sub) {
    c.res = c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    }, 401);
    return;
  }
  
  // Attach user ID to context
  c.set('userId', payload.sub);
  
  await next();
};

/**
 * Require authenticated user
 * Returns user object or throws error
 */
export async function requireUser(c: Context<{ Bindings: Env; Variables: Variables }>): Promise<User> {
  const userId = c.get('userId');
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // For development, return a mock user
  if (c.env.ENVIRONMENT === 'development') {
    // Try to get or create dev user
    let user = await getUserByAppleId(c.env.DB, `dev_${userId}`);
    if (!user) {
      user = await createUser(c.env.DB, {
        id: userId,
        apple_id: `dev_${userId}`,
        nickname: 'Dev User',
        timezone: 'Asia/Shanghai',
      });
    }
    return user;
  }
  
  // In production, fetch user from database
  // TODO: Implement getUserById
  const user = await getUserByAppleId(c.env.DB, userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

/**
 * Optional authentication
 * Attaches user if token is present, but doesn't require it
 */
export const optionalAuth: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);
  
  if (token && c.env.JWT_SECRET) {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (payload?.sub) {
      c.set('userId', payload.sub);
    }
  }
  
  await next();
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, use Cloudflare's built-in rate limiting or Durable Objects
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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
