/**
 * JWT Utilities
 * Token generation, verification, and refresh for CigarAtlas API
 */

import * as jwt from '@tsndr/cloudflare-worker-jwt';
import type { JwtPayload } from '../types';

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate access token
 * @param userId - User ID to encode in token
 * @param secret - JWT secret key
 * @returns Signed JWT access token
 */
export async function generateAccessToken(userId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: JwtPayload = {
    sub: userId,
    iat: now,
    exp: now + 3600, // 1 hour
    type: 'access',
  };
  
  return await jwt.sign(payload, secret, {
    algorithm: 'HS256',
  });
}

/**
 * Generate refresh token
 * @param userId - User ID to encode in token
 * @param secret - JWT secret key
 * @returns Signed JWT refresh token
 */
export async function generateRefreshToken(userId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: JwtPayload = {
    sub: userId,
    iat: now,
    exp: now + 604800, // 7 days
    type: 'refresh',
  };
  
  return await jwt.sign(payload, secret, {
    algorithm: 'HS256',
  });
}

/**
 * Generate token pair (access + refresh)
 * @param userId - User ID to encode in tokens
 * @param secret - JWT secret key
 * @returns Object containing both tokens
 */
export async function generateTokenPair(userId: string, secret: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userId, secret),
    generateRefreshToken(userId, secret),
  ]);
  
  return { accessToken, refreshToken };
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @param secret - JWT secret key
 * @returns Decoded payload if valid, null otherwise
 */
export async function verifyToken(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const isValid = await jwt.verify(token, secret);
    if (!isValid) {
      return null;
    }
    
    const payload = jwt.decode(token).payload as JwtPayload;
    
    // Validate required fields
    if (!payload.sub || !payload.exp || !payload.type) {
      return null;
    }
    
    // Check expiration (jwt.verify already checks this, but double-check)
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify access token specifically
 * @param token - JWT access token
 * @param secret - JWT secret key
 * @returns Decoded payload if valid access token, null otherwise
 */
export async function verifyAccessToken(token: string, secret: string): Promise<JwtPayload | null> {
  const payload = await verifyToken(token, secret);
  
  if (!payload || payload.type !== 'access') {
    return null;
  }
  
  return payload;
}

/**
 * Verify refresh token specifically
 * @param token - JWT refresh token
 * @param secret - JWT secret key
 * @returns Decoded payload if valid refresh token, null otherwise
 */
export async function verifyRefreshToken(token: string, secret: string): Promise<JwtPayload | null> {
  const payload = await verifyToken(token, secret);
  
  if (!payload || payload.type !== 'refresh') {
    return null;
  }
  
  return payload;
}

// ============================================================================
// Token Refresh
// ============================================================================

/**
 * Refresh access token using refresh token
 * @param refreshToken - Valid refresh token
 * @param secret - JWT secret key
 * @returns New token pair if refresh token is valid, null otherwise
 */
export async function refreshTokens(
  refreshToken: string,
  secret: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const payload = await verifyRefreshToken(refreshToken, secret);
  
  if (!payload || !payload.sub) {
    return null;
  }
  
  // Generate new token pair
  return await generateTokenPair(payload.sub, secret);
}

// ============================================================================
// Token Extraction
// ============================================================================

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extract token from request (header or query parameter)
 * @param authHeader - Authorization header value
 * @param queryToken - Token from query parameter (for websockets, etc.)
 * @returns Token string or null
 */
export function extractTokenFromRequest(
  authHeader: string | undefined,
  queryToken: string | undefined
): string | null {
  // Try header first
  const headerToken = extractToken(authHeader);
  if (headerToken) {
    return headerToken;
  }
  
  // Fall back to query parameter
  if (queryToken) {
    return queryToken;
  }
  
  return null;
}
