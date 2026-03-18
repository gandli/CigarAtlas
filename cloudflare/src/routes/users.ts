/**
 * User Routes - User management endpoints
 * All routes require authentication
 */

import { Hono } from 'hono';
import type { Env, ApiResponse, User } from '../types';
import { authMiddleware, requireUser } from '../middleware/auth';
import { getUserById, updateUser, deleteUser } from '../db/users';

const users = new Hono<{ Bindings: Env }>();

// All user routes require authentication
users.use('/*', authMiddleware);

/**
 * GET /v1/users/me
 * Get current authenticated user
 * This is the preferred endpoint for getting the current user's info
 */
users.get('/me', async (c) => {
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

/**
 * PUT /v1/users/me
 * Update current user's profile
 */
users.put('/me', async (c) => {
  try {
    const user = await requireUser(c);
    
    let body: {
      nickname?: string | null;
      avatar_url?: string | null;
      timezone?: string;
      preferences?: string | null;
    };
    
    try {
      body = await c.req.json();
    } catch {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON body',
        },
      }, 400);
    }

    const updatedUser = await updateUser(c.env.DB, user.id, {
      nickname: body.nickname,
      avatar_url: body.avatar_url,
      timezone: body.timezone,
      preferences: body.preferences,
    });

    if (!updatedUser) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update user profile',
        },
      }, 500);
    }

    return c.json<ApiResponse<User>>({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user profile',
      },
    }, 500);
  }
});

/**
 * DELETE /v1/users/me
 * Delete current user's account (soft delete recommended)
 */
users.delete('/me', async (c) => {
  try {
    const user = await requireUser(c);

    // In production, you should:
    // 1. Implement soft delete (set deleted_at timestamp)
    // 2. Archive or anonymize user data
    // 3. Revoke all active tokens
    // 4. Send confirmation email
    
    const deleted = await deleteUser(c.env.DB, user.id);

    if (!deleted) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete user account',
        },
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      data: {
        message: 'User account deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete user account',
      },
    }, 500);
  }
});

/**
 * GET /v1/users/:id
 * Get user by ID (admin only or same user)
 */
users.get('/:id', async (c) => {
  try {
    const currentUser = await requireUser(c);
    const targetUserId = c.req.param('id');

    // Users can only access their own data (unless you implement admin roles)
    if (currentUser.id !== targetUserId) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own user data',
        },
      }, 403);
    }

    const user = await getUserById(c.env.DB, targetUserId);

    if (!user) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      }, 404);
    }

    return c.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user',
      },
    }, 500);
  }
});

export default users;
