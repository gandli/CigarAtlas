/**
 * CigarAtlas Validation Schemas
 * Using Zod for input validation
 */

import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

export const AppleSignInSchema = z.object({
  identityToken: z.string().min(1, 'Identity token is required'),
  authorizationCode: z.string().min(1, 'Authorization code is required'),
  fullName: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Humidor Schemas
// ============================================================================

export const CreateHumidorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  type: z.enum(['cabinet', 'cooler', 'desktop', 'travel']).optional().default('cabinet'),
  description: z.string().max(500).optional(),
  target_temperature_min: z.number().min(-10).max(40).optional().default(16.0),
  target_temperature_max: z.number().min(-10).max(40).optional().default(18.0),
  target_humidity_min: z.number().min(0).max(100).optional().default(65.0),
  target_humidity_max: z.number().min(0).max(100).optional().default(70.0),
  capacity: z.number().int().positive().optional(),
});

export const UpdateHumidorSchema = CreateHumidorSchema.partial().extend({
  image_url: z.string().url().optional(),
  is_default: z.boolean().optional(),
});

// ============================================================================
// Cigar Schemas
// ============================================================================

export const CreateCigarSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(100),
  line: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  vitola: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
  wrapper: z.string().max(50).optional(),
  binder: z.string().max(50).optional(),
  filler: z.string().max(50).optional(),
  strength: z.enum(['mild', 'medium', 'full']).optional(),
  quantity: z.number().int().min(0).default(1),
  purchase_date: z.string().datetime().optional(),
  purchase_price: z.number().min(0).optional(),
  purchase_location: z.string().max(200).optional(),
  flavor_notes: z.array(z.string()).optional(),
  personal_notes: z.string().max(2000).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const UpdateCigarSchema = CreateCigarSchema.partial().extend({
  image_url: z.string().url().optional(),
  smoking_status: z.enum(['unsmoked', 'partial', 'finished']).optional(),
});

// ============================================================================
// Environment Log Schemas
// ============================================================================

export const CreateEnvironmentLogSchema = z.object({
  temperature: z.number().min(-20).max(60, 'Temperature out of reasonable range'),
  humidity: z.number().min(0).max(100, 'Humidity must be 0-100%'),
  logged_at: z.string().datetime().optional(),
  source: z.enum(['manual', 'sensor', 'iot']).optional().default('manual'),
  device_id: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

// ============================================================================
// Reminder Schemas
// ============================================================================

export const CreateReminderSchema = z.object({
  type: z.enum(['check', 'smoke', 'rotate', 'hydrate']),
  title: z.string().max(100).optional(),
  interval_days: z.number().int().min(1).max(365),
  next_at: z.string().datetime().optional(),
  notification_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().default('09:00'),
  note: z.string().max(500).optional(),
});

export const UpdateReminderSchema = CreateReminderSchema.partial().extend({
  enabled: z.boolean().optional(),
});

// ============================================================================
// Pagination Schema
// ============================================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ValidatedAppleSignIn = z.infer<typeof AppleSignInSchema>;
export type ValidatedHumidor = z.infer<typeof CreateHumidorSchema>;
export type ValidatedHumidorUpdate = z.infer<typeof UpdateHumidorSchema>;
export type ValidatedCigar = z.infer<typeof CreateCigarSchema>;
export type ValidatedCigarUpdate = z.infer<typeof UpdateCigarSchema>;
export type ValidatedEnvironmentLog = z.infer<typeof CreateEnvironmentLogSchema>;
export type ValidatedReminder = z.infer<typeof CreateReminderSchema>;
export type ValidatedReminderUpdate = z.infer<typeof UpdateReminderSchema>;
export type ValidatedPagination = z.infer<typeof PaginationSchema>;