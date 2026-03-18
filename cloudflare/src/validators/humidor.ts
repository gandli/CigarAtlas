/**
 * Humidor Validators
 * Zod schemas for humidor request validation
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export const humidorTypes = ['cabinet', 'cooler', 'desktop', 'travel'] as const;
export type HumidorType = (typeof humidorTypes)[number];

// ============================================================================
// Path Parameter Validators
// ============================================================================

/**
 * Humidor ID path parameter validator
 */
export const humidorIdParamsSchema = z.object({
  id: z.string().min(1, 'Humidor ID is required'),
});

export type HumidorIdParams = z.infer<typeof humidorIdParamsSchema>;

// ============================================================================
// Request Body Validators
// ============================================================================

/**
 * Humidor creation schema
 * Required: name
 * Optional: type, description, temperature/humidity ranges, capacity
 */
export const createHumidorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  type: z
    .enum(humidorTypes)
    .optional()
    .default('cabinet'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  
  target_temperature_min: z
    .number()
    .min(-10, 'Temperature must be at least -10°C')
    .max(50, 'Temperature must be at most 50°C')
    .optional(),
  
  target_temperature_max: z
    .number()
    .min(-10, 'Temperature must be at least -10°C')
    .max(50, 'Temperature must be at most 50°C')
    .optional(),
  
  target_humidity_min: z
    .number()
    .min(0, 'Humidity must be at least 0%')
    .max(100, 'Humidity must be at most 100%')
    .optional(),
  
  target_humidity_max: z
    .number()
    .min(0, 'Humidity must be at least 0%')
    .max(100, 'Humidity must be at most 100%')
    .optional(),
  
  capacity: z
    .number()
    .int()
    .nonnegative('Capacity must be non-negative')
    .optional()
    .nullable(),
});

export type CreateHumidorInput = z.infer<typeof createHumidorSchema>;

/**
 * Humidor update schema
 * All fields are optional for partial updates
 */
export const updateHumidorSchema = createHumidorSchema.partial().extend({
  image_url: z
    .string()
    .url('Invalid URL format')
    .optional()
    .nullable(),
  
  is_default: z
    .boolean()
    .optional(),
});

export type UpdateHumidorInput = z.infer<typeof updateHumidorSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> };

/**
 * Validate data against a Zod schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return { success: false, errors };
}

/**
 * Format validation errors for API response
 */
export function validationErrorResponse(
  errors: Array<{ field: string; message: string }>
) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors,
    },
  };
}

// ============================================================================
// Cross-field Validation
// ============================================================================

/**
 * Validate temperature range consistency
 * min should be less than or equal to max
 */
export function validateTemperatureRange(
  min: number | undefined,
  max: number | undefined
): { valid: boolean; error?: string } {
  if (min !== undefined && max !== undefined && min > max) {
    return {
      valid: false,
      error: 'Minimum temperature cannot be greater than maximum temperature',
    };
  }
  return { valid: true };
}

/**
 * Validate humidity range consistency
 * min should be less than or equal to max
 */
export function validateHumidityRange(
  min: number | undefined,
  max: number | undefined
): { valid: boolean; error?: string } {
  if (min !== undefined && max !== undefined && min > max) {
    return {
      valid: false,
      error: 'Minimum humidity cannot be greater than maximum humidity',
    };
  }
  return { valid: true };
}
