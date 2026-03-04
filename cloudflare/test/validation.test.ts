/**
 * Validation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validate,
  validationErrorResponse,
  createHumidorSchema,
  updateHumidorSchema,
  createCigarSchema,
  createEnvironmentLogSchema,
  createReminderSchema,
} from '../utils/validation';

describe('Validation - Humidor', () => {
  describe('createHumidorSchema', () => {
    it('should validate valid humidor data', () => {
      const validData = {
        name: 'My Humidor',
        type: 'cabinet' as const,
        description: 'A nice humidor',
        target_temperature_min: 16,
        target_temperature_max: 18,
        target_humidity_min: 65,
        target_humidity_max: 70,
        capacity: 100,
      };

      const result = validate(createHumidorSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('My Humidor');
        expect(result.data.type).toBe('cabinet');
      }
    });

    it('should reject missing name', () => {
      const invalidData = { type: 'cabinet' };
      const result = validate(createHumidorSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.field === 'name')).toBe(true);
      }
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = { name: 'a'.repeat(101) };
      const result = validate(createHumidorSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.field === 'name')).toBe(true);
      }
    });

    it('should reject invalid temperature range', () => {
      const invalidData = {
        name: 'Test',
        target_temperature_min: -20, // Too low
      };
      const result = validate(createHumidorSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.field === 'target_temperature_min')).toBe(true);
      }
    });

    it('should reject invalid humidity range', () => {
      const invalidData = {
        name: 'Test',
        target_humidity_max: 150, // Too high
      };
      const result = validate(createHumidorSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.field === 'target_humidity_max')).toBe(true);
      }
    });

    it('should reject negative capacity', () => {
      const invalidData = {
        name: 'Test',
        capacity: -5,
      };
      const result = validate(createHumidorSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.field === 'capacity')).toBe(true);
      }
    });

    it('should accept optional fields as undefined', () => {
      const minimalData = { name: 'Test' };
      const result = validate(createHumidorSchema, minimalData);
      
      expect(result.success).toBe(true);
    });
  });

  describe('updateHumidorSchema', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Updated Name',
      };
      const result = validate(updateHumidorSchema, updateData);
      
      expect(result.success).toBe(true);
    });

    it('should accept image_url as valid URL', () => {
      const updateData = {
        image_url: 'https://example.com/image.jpg',
      };
      const result = validate(updateHumidorSchema, updateData);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid image_url', () => {
      const updateData = {
        image_url: 'not-a-url',
      };
      const result = validate(updateHumidorSchema, updateData);
      
      expect(result.success).toBe(false);
    });

    it('should accept is_default boolean', () => {
      const updateData = { is_default: true };
      const result = validate(updateHumidorSchema, updateData);
      
      expect(result.success).toBe(true);
    });
  });
});

describe('Validation - Cigar', () => {
  describe('createCigarSchema', () => {
    it('should validate valid cigar data', () => {
      const validData = {
        brand: 'Cohiba',
        line: 'Robusto',
        size: '5x50',
        country: 'Cuba',
        strength: 'medium' as const,
        quantity: 10,
        rating: 4,
      };

      const result = validate(createCigarSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing brand', () => {
      const invalidData = { line: 'Robusto' };
      const result = validate(createCigarSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid strength', () => {
      const invalidData = {
        brand: 'Test',
        strength: 'extra-strong',
      };
      const result = validate(createCigarSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject rating outside 1-5 range', () => {
      const invalidData = {
        brand: 'Test',
        rating: 6,
      };
      const result = validate(createCigarSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should accept empty flavor_notes array', () => {
      const validData = {
        brand: 'Test',
        flavor_notes: [],
      };
      const result = validate(createCigarSchema, validData);
      
      expect(result.success).toBe(true);
    });

    it('should reject more than 20 flavor notes', () => {
      const invalidData = {
        brand: 'Test',
        flavor_notes: Array(21).fill('note'),
      };
      const result = validate(createCigarSchema, invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation - Environment Log', () => {
  describe('createEnvironmentLogSchema', () => {
    it('should validate valid log data', () => {
      const validData = {
        temperature: 18.5,
        humidity: 68,
        source: 'sensor' as const,
      };

      const result = validate(createEnvironmentLogSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject temperature out of range', () => {
      const invalidData = {
        temperature: 60, // Too high
        humidity: 68,
      };
      const result = validate(createEnvironmentLogSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject humidity out of range', () => {
      const invalidData = {
        temperature: 18,
        humidity: -10, // Too low
      };
      const result = validate(createEnvironmentLogSchema, invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation - Reminder', () => {
  describe('createReminderSchema', () => {
    it('should validate valid reminder data', () => {
      const validData = {
        type: 'check' as const,
        interval_days: 7,
        title: 'Weekly Check',
      };

      const result = validate(createReminderSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing type', () => {
      const invalidData = {
        interval_days: 7,
      };
      const result = validate(createReminderSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject non-positive interval', () => {
      const invalidData = {
        type: 'check',
        interval_days: 0,
      };
      const result = validate(createReminderSchema, invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should accept valid notification_time format', () => {
      const validData = {
        type: 'check',
        interval_days: 7,
        notification_time: '14:30',
      };
      const result = validate(createReminderSchema, validData);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid notification_time format', () => {
      const invalidData = {
        type: 'check',
        interval_days: 7,
        notification_time: '25:00',
      };
      const result = validate(createReminderSchema, invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Error Response', () => {
  it('should format errors correctly', () => {
    const errors = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Invalid email' },
    ];

    const response = validationErrorResponse(errors);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.details).toEqual(errors);
  });
});
