/**
 * Humidor Routes
 * Handles humidor (雪茄柜) CRUD operations and statistics
 */

import { Hono } from 'hono';
import type { Env, ApiResponse, Humidor, HumidorSummary } from '../types';
import { validate, createHumidorSchema, updateHumidorSchema, validationErrorResponse } from '../utils/validation';
import { authMiddleware, requireUser } from '../middleware/auth';
import {
  createHumidor,
  getHumidorById,
  getHumidorsByUserId,
  updateHumidor,
  deleteHumidor,
  generateId,
  getDefaultHumidor,
  getHumidorSummary,
  getUserHumidorSummaries,
} from '../db/index';

const humidors = new Hono<{ Bindings: Env }>();

// All humidor routes require authentication
humidors.use('/*', authMiddleware);

/**
 * GET /v1/humidors
 * List all humidors for the current user with summaries
 */
humidors.get('/', async (c) => {
  try {
    const user = await requireUser(c);
    
    // Use optimized batch query for summaries
    const humidors = await getUserHumidorSummaries(c.env.DB, user.id);

    return c.json<ApiResponse<HumidorSummary[]>>({
      success: true,
      data: humidors,
    });
  } catch (error) {
    console.error('List humidors error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found',
        },
      }, 404);
    }

    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve humidors',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/summary
 * Get summaries for all user's humidors (lightweight version)
 */
humidors.get('/summary', async (c) => {
  try {
    const user = await requireUser(c);
    
    const summaries = await getUserHumidorSummaries(c.env.DB, user.id);

    return c.json<ApiResponse<HumidorSummary[]>>({
      success: true,
      data: summaries,
    });
  } catch (error) {
    console.error('Get humidor summaries error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve humidor summaries',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/:id
 * Get a specific humidor by ID
 */
humidors.get('/:id', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

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

    // Check ownership
    if (humidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    return c.json<ApiResponse<Humidor>>({
      success: true,
      data: humidor,
    });
  } catch (error) {
    console.error('Get humidor error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve humidor',
      },
    }, 500);
  }
});

/**
 * GET /v1/humidors/:id/summary
 * Get detailed summary for a specific humidor
 */
humidors.get('/:id/summary', async (c) => {
  try {
    const user = await requireUser(c);
    const humidorId = c.req.param('id');

    const summary = await getHumidorSummary(c.env.DB, humidorId);

    if (!summary) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    // Check ownership
    if (summary.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    return c.json<ApiResponse<HumidorSummary>>({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get humidor summary error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve humidor summary',
      },
    }, 500);
  }
});

/**
 * POST /v1/humidors
 * Create a new humidor
 */
humidors.post('/', async (c) => {
  let body: unknown;
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

  // Validate input
  const result = validate(createHumidorSchema, body);
  if (!result.success) {
    return c.json<ApiResponse>(validationErrorResponse(result.errors), 400);
  }

  const data = result.data;

  try {
    const user = await requireUser(c);

    // Check if this should be the default humidor
    let isDefault = 0;
    const existingHumidors = await getHumidorsByUserId(c.env.DB, user.id);
    
    if (existingHumidors.length === 0) {
      // First humidor is always default
      isDefault = 1;
    } else if (data.type === 'cabinet') {
      // Cabinet type is preferred as default
      const hasDefault = existingHumidors.some(h => h.is_default === 1);
      if (!hasDefault) {
        isDefault = 1;
      }
    }

    const humidor = await createHumidor(c.env.DB, {
      id: generateId(),
      user_id: user.id,
      name: data.name,
      type: data.type ?? 'cabinet',
      description: data.description ?? null,
      target_temperature_min: data.target_temperature_min ?? 16.0,
      target_temperature_max: data.target_temperature_max ?? 18.0,
      target_humidity_min: data.target_humidity_min ?? 65.0,
      target_humidity_max: data.target_humidity_max ?? 70.0,
      image_url: null,
      capacity: data.capacity ?? null,
      is_default: isDefault,
    });

    return c.json<ApiResponse<Humidor>>({
      success: true,
      data: humidor,
    }, 201);
  } catch (error) {
    console.error('Create humidor error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create humidor',
      },
    }, 500);
  }
});

/**
 * PUT /v1/humidors/:id
 * Update a humidor (full update)
 */
humidors.put('/:id', async (c) => {
  let body: unknown;
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

  // Validate input
  const result = validate(updateHumidorSchema, body);
  if (!result.success) {
    return c.json<ApiResponse>(validationErrorResponse(result.errors), 400);
  }

  const data = result.data;
  const humidorId = c.req.param('id');

  try {
    const user = await requireUser(c);

    // Check if humidor exists and user owns it
    const existingHumidor = await getHumidorById(c.env.DB, humidorId);
    if (!existingHumidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (existingHumidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Handle is_default logic - if setting this as default, unset others
    if (data.is_default === true) {
      const allHumidors = await getHumidorsByUserId(c.env.DB, user.id);
      for (const h of allHumidors) {
        if (h.id !== humidorId && h.is_default === 1) {
          await updateHumidor(c.env.DB, h.id, { is_default: 0 });
        }
      }
    }

    const updatedHumidor = await updateHumidor(c.env.DB, humidorId, {
      name: data.name,
      type: data.type,
      description: data.description,
      target_temperature_min: data.target_temperature_min,
      target_temperature_max: data.target_temperature_max,
      target_humidity_min: data.target_humidity_min,
      target_humidity_max: data.target_humidity_max,
      capacity: data.capacity,
      image_url: data.image_url,
      is_default: data.is_default !== undefined ? (data.is_default ? 1 : 0) : undefined,
    });

    if (!updatedHumidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update humidor',
        },
      }, 500);
    }

    return c.json<ApiResponse<Humidor>>({
      success: true,
      data: updatedHumidor,
    });
  } catch (error) {
    console.error('Update humidor error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update humidor',
      },
    }, 500);
  }
});

/**
 * PATCH /v1/humidors/:id
 * Update a humidor (partial update)
 */
humidors.patch('/:id', async (c) => {
  let body: unknown;
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

  // Validate input (same schema as PUT, but all fields optional)
  const result = validate(updateHumidorSchema, body);
  if (!result.success) {
    return c.json<ApiResponse>(validationErrorResponse(result.errors), 400);
  }

  const data = result.data;
  const humidorId = c.req.param('id');

  try {
    const user = await requireUser(c);

    // Check if humidor exists and user owns it
    const existingHumidor = await getHumidorById(c.env.DB, humidorId);
    if (!existingHumidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (existingHumidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    // Handle is_default logic
    if (data.is_default === true) {
      const allHumidors = await getHumidorsByUserId(c.env.DB, user.id);
      for (const h of allHumidors) {
        if (h.id !== humidorId && h.is_default === 1) {
          await updateHumidor(c.env.DB, h.id, { is_default: 0 });
        }
      }
    }

    const updatedHumidor = await updateHumidor(c.env.DB, humidorId, {
      name: data.name,
      type: data.type,
      description: data.description,
      target_temperature_min: data.target_temperature_min,
      target_temperature_max: data.target_temperature_max,
      target_humidity_min: data.target_humidity_min,
      target_humidity_max: data.target_humidity_max,
      capacity: data.capacity,
      image_url: data.image_url,
      is_default: data.is_default !== undefined ? (data.is_default ? 1 : 0) : undefined,
    });

    if (!updatedHumidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update humidor',
        },
      }, 500);
    }

    return c.json<ApiResponse<Humidor>>({
      success: true,
      data: updatedHumidor,
    });
  } catch (error) {
    console.error('Patch humidor error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update humidor',
      },
    }, 500);
  }
});

/**
 * DELETE /v1/humidors/:id
 * Delete a humidor
 */
humidors.delete('/:id', async (c) => {
  const humidorId = c.req.param('id');

  try {
    const user = await requireUser(c);

    // Check if humidor exists and user owns it
    const existingHumidor = await getHumidorById(c.env.DB, humidorId);
    if (!existingHumidor) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Humidor not found',
        },
      }, 404);
    }

    if (existingHumidor.user_id !== user.id) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this humidor',
        },
      }, 403);
    }

    const deleted = await deleteHumidor(c.env.DB, humidorId);

    if (!deleted) {
      return c.json<ApiResponse>({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete humidor',
        },
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      data: {
        message: 'Humidor deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete humidor error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete humidor',
      },
    }, 500);
  }
});

export default humidors;
