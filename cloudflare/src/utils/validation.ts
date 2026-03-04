/**
 * Validation Utilities
 * Zod-based request validation for CigarAtlas API
 */

import { z } from 'zod';
import type { HumidorType, CigarStrength, SmokingStatus, LogSource, ReminderType } from '../types';

// ============================================================================
// Schemas
// ============================================================================

/**
 * Humidor creation schema
 */
export const createHumidorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['cabinet', 'cooler', 'desktop', 'travel']).optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  target_temperature_min: z.number().min(-10, 'Temperature must be at least -10°C').max(50, 'Temperature must be at most 50°C').optional(),
  target_temperature_max: z.number().min(-10, 'Temperature must be at least -10°C').max(50, 'Temperature must be at most 50°C').optional(),
  target_humidity_min: z.number().min(0, 'Humidity must be at least 0%').max(100, 'Humidity must be at most 100%').optional(),
  target_humidity_max: z.number().min(0, 'Humidity must be at least 0%').max(100, 'Humidity must be at most 100%').optional(),
  capacity: z.number().int().nonnegative('Capacity must be non-negative').optional(),
});

/**
 * Humidor update schema (all fields optional)
 */
export const updateHumidorSchema = createHumidorSchema.partial().extend({
  image_url: z.string().url('Invalid URL format').optional().or(z.null()),
  is_default: z.boolean().optional(),
});

/**
 * Cigar creation schema
 */
export const createCigarSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(100, 'Brand must be less than 100 characters'),
  line: z.string().max(100, 'Line must be less than 100 characters').optional(),
  size: z.string().max(50, 'Size must be less than 50 characters').optional(),
  vitola: z.string().max(50, 'Vitola must be less than 50 characters').optional(),
  country: z.string().max(50, 'Country must be less than 50 characters').optional(),
  wrapper: z.string().max(100, 'Wrapper must be less than 100 characters').optional(),
  binder: z.string().max(100, 'Binder must be less than 100 characters').optional(),
  filler: z.string().max(100, 'Filler must be less than 100 characters').optional(),
  strength: z.enum(['mild', 'medium', 'full']).optional(),
  quantity: z.number().int().positive('Quantity must be positive').default(1),
  purchase_date: z.string().datetime({ offset: true }).optional().or(z.null()),
  purchase_price: z.number().nonnegative('Purchase price must be non-negative').optional().or(z.null()),
  purchase_location: z.string().max(100, 'Purchase location must be less than 100 characters').optional(),
  flavor_notes: z.array(z.string()).max(20, 'Maximum 20 flavor notes').optional(),
  personal_notes: z.string().max(1000, 'Personal notes must be less than 1000 characters').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional().or(z.null()),
});

/**
 * Cigar update schema
 */
export const updateCigarSchema = createCigarSchema.partial().extend({
  image_url: z.string().url('Invalid URL format').optional().or(z.null()),
  smoking_status: z.enum(['unsmoked', 'partial', 'finished']).optional(),
});

/**
 * Environment log creation schema
 */
export const createEnvironmentLogSchema = z.object({
  temperature: z.number().min(-10, 'Temperature must be at least -10°C').max(50, 'Temperature must be at most 50°C'),
  humidity: z.number().min(0, 'Humidity must be at least 0%').max(100, 'Humidity must be at most 100%'),
  logged_at: z.string().datetime({ offset: true }).optional(),
  source: z.enum(['manual', 'sensor', 'iot']).optional(),
  device_id: z.string().max(100, 'Device ID must be less than 100 characters').optional().or(z.null()),
  note: z.string().max(500, 'Note must be less than 500 characters').optional().or(z.null()),
});

/**
 * Reminder creation schema
 */
export const createReminderSchema = z.object({
  type: z.enum(['check', 'smoke', 'rotate', 'hydrate']),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  interval_days: z.number().int().positive('Interval must be positive'),
  next_at: z.string().datetime({ offset: true }).optional(),
  notification_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
});

/**
 * Reminder update schema
 */
export const updateReminderSchema = createReminderSchema.partial().extend({
  enabled: z.boolean().optional(),
});

// ============================================================================
// Validation Functions
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
export function validationErrorResponse(errors: Array<{ field: string; message: string }>) {
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
// Type exports for convenience
// ============================================================================

export type CreateHumidorInput = z.infer<typeof createHumidorSchema>;
export type UpdateHumidorInput = z.infer<typeof updateHumidorSchema>;
export type CreateCigarInput = z.infer<typeof createCigarSchema>;
export type UpdateCigarInput = z.infer<typeof updateCigarSchema>;
export type CreateEnvironmentLogInput = z.infer<typeof createEnvironmentLogSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
