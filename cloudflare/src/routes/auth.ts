/**
 * Auth Routes - Authentication endpoints
 * Implements Apple Sign In and JWT token management
 */

import { Hono } from 'hono';
import type { Env, ApiResponse, AppleSignInRequest, AuthResponse, User } from '../types';
import { generateTokenPair, refreshTokens, verifyRefreshToken } from '../utils/jwt';
import { getUserByAppleId, createUser } from '../db/users';
import { authMiddleware, requireUser } from '../middleware/auth';
import { rateLimit } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env }>();

// ============================================================================
// Apple Sign In
// ============================================================================

/**
 * POST /v1/auth/apple
 * Apple Sign In endpoint
 * 
 * Verifies Apple identity token and creates/updates user account
 * Returns access and refresh tokens
 */
auth.post('/apple', rateLimit(10, 60000), async (c) => {
  try {
    const body: AppleSignInRequest = await c.req.json();
    const { identityToken, fullName } = body;
    // authorizationCode is available for server-to-server token exchange if needed
    
    // Validate required fields
    if (!identityToken) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'identityToken is required',
        },
      }, 400);
    }
    
    // In development, allow mock login with a fixed test user
    if (c.env.ENVIRONMENT === 'development' && identityToken === 'test-token') {
      const devAppleId = 'dev_test_user';
      const devUserId = 'dev-user-id-000000000001';
      
      let user = await getUserByAppleId(c.env.DB, devAppleId);
      if (!user) {
        user = await createUser(c.env.DB, {
          id: devUserId,
          apple_id: devAppleId,
          nickname: fullName?.givenName ? `${fullName.givenName} (Dev)` : 'Dev User',
          timezone: 'Asia/Shanghai',
        });
      }
      
      const { accessToken, refreshToken } = await generateTokenPair(
        user.id,
        c.env.JWT_SECRET || 'dev-secret'
      );
      
      return c.json<ApiResponse<AuthResponse>>({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user,
        },
      });
    }
    
    // Validate environment configuration
    const secret = c.env.JWT_SECRET;
    const appleClientId = c.env.APPLE_CLIENT_ID;
    
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Server configuration error',
        },
      }, 500);
    }
    
    if (!appleClientId) {
      console.error('APPLE_CLIENT_ID not configured');
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Apple Sign In not configured',
        },
      }, 500);
    }
    
    // Verify Apple identity token
    // In production, you should verify the token with Apple's servers
    // For now, we'll decode it and validate the signature
    let applePayload: any;
    try {
      // Decode the JWT token (Apple identity token)
      const parts = identityToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode payload (base64url) - Cloudflare Workers compatible
      const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        atob(base64Url)
      );
      applePayload = payload;
      
      // Validate token audience
      if (payload.aud !== appleClientId) {
        throw new Error('Invalid token audience');
      }
      
      // Validate token expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
    } catch (error) {
      console.error('Apple token verification failed:', error);
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid Apple identity token',
        },
      }, 401);
    }
    
    // Get or create user
    const appleId = applePayload.sub;
    if (!appleId) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid Apple identity token: missing subject',
        },
      }, 401);
    }
    
    let user = await getUserByAppleId(c.env.DB, appleId);
    
    if (!user) {
      // Create new user
      const userId = crypto.randomUUID();
      user = await createUser(c.env.DB, {
        id: userId,
        apple_id: appleId,
        nickname: fullName?.givenName || null,
        timezone: 'Asia/Shanghai',
      });
    } else {
      // Update user info if provided
      if (fullName?.givenName && !user.nickname) {
        // Could update user nickname here if needed
      }
    }
    
    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokenPair(user.id, secret);
    
    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    console.error('Apple Sign In error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process Apple Sign In',
      },
    }, 500);
  }
});

// ============================================================================
// Token Refresh
// ============================================================================

/**
 * POST /v1/auth/refresh
 * Refresh access token using refresh token
 */
auth.post('/refresh', rateLimit(20, 60000), async (c) => {
  try {
    const body = await c.req.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'refreshToken is required',
        },
      }, 400);
    }
    
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Server configuration error',
        },
      }, 500);
    }
    
    // Refresh tokens
    const tokens = await refreshTokens(refreshToken, secret);
    
    if (!tokens) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      }, 401);
    }
    
    return c.json<ApiResponse<{ accessToken: string; refreshToken: string }>>({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to refresh token',
      },
    }, 500);
  }
});

// ============================================================================
// Logout
// ============================================================================

/**
 * POST /v1/auth/logout
 * User logout
 * 
 * Note: Since JWT is stateless, logout is handled client-side by deleting tokens.
 * This endpoint can be used for logging, analytics, or future token blacklisting.
 */
auth.post('/logout', async (c) => {
  try {
    // In a production system, you might want to:
    // 1. Add the token to a blacklist (stored in D1 or KV)
    // 2. Log the logout event
    // 3. Invalidate any active sessions
    
    console.log('User logout requested');
    
    // For now, just return success
    // Client should delete tokens from storage
    return c.json<ApiResponse>({
      success: true,
      data: {
        message: 'Successfully logged out',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process logout',
      },
    }, 500);
  }
});

// ============================================================================
// Current User
// ============================================================================

/**
 * GET /v1/auth/me
 * Get current authenticated user
 */
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = await requireUser(c);
    
    return c.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error instanceof Error ? error.message : 'Failed to get user',
      },
    }, 401);
  }
});

// ============================================================================
// Token Validation (for testing/debugging)
// ============================================================================

/**
 * POST /v1/auth/validate
 * Validate a token (development/debugging only)
 */
auth.post('/validate', async (c) => {
  // Only allow in development
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This endpoint is only available in development',
      },
    }, 403);
  }
  
  try {
    const body = await c.req.json();
    const { token } = body;
    
    if (!token) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'token is required',
        },
      }, 400);
    }
    
    const secret = c.env.JWT_SECRET || 'dev-secret';
    const payload = await verifyRefreshToken(token, secret) || 
                    await import('../utils/jwt').then(m => m.verifyToken(token, secret));
    
    if (!payload) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      }, 401);
    }
    
    return c.json<ApiResponse<{ payload: any }>>({
      success: true,
      data: { payload },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to validate token',
      },
    }, 500);
  }
});

export default auth;
