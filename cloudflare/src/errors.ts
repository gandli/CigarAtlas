/**
 * CigarAtlas Error Handling Utilities
 */

import type { ApiResponse } from './types';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  toResponse(): ApiResponse {
    const errorObj: { code: string; message: string; details?: unknown } = {
      code: this.code,
      message: this.message,
    };
    
    if (this.details !== undefined) {
      errorObj.details = this.details;
    }
    
    return {
      success: false,
      error: errorObj,
    };
  }
}

// ============================================================================
// Error Factories
// ============================================================================

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id '${id}' not found` 
      : `${resource} not found`;
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super('RATE_LIMITED', message, 429);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateWithZod<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
  errorMessage: string = 'Invalid request data'
): T {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as { issues: Array<{ path: string[]; message: string }> }).issues;
      const details = issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      throw new ValidationError(errorMessage, details);
    }
    throw new ValidationError(errorMessage);
  }
}

// ============================================================================
// Database Error Handling
// ============================================================================

export function handleD1Error(error: unknown): AppError {
  if (error && typeof error === 'object') {
    const err = error as { message?: string; cause?: { message?: string } };
    
    if (err.message?.includes('D1_ERROR')) {
      return new AppError('DATABASE_ERROR', 'Database operation failed', 500);
    }
    
    if (err.message?.includes('UNIQUE constraint failed')) {
      return new ConflictError('Resource already exists');
    }
    
    if (err.message?.includes('FOREIGN KEY constraint failed')) {
      return new ValidationError('Referenced resource does not exist');
    }
  }
  
  return new AppError('DATABASE_ERROR', 'Database operation failed', 500);
}