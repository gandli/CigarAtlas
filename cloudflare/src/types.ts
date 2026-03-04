/**
 * CigarAtlas TypeScript Type Definitions
 * Version: 1.0.0
 */

// ============================================================================
// Environment Types (Cloudflare bindings)
// ============================================================================

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  // JWT secrets (set in .dev.vars or Cloudflare dashboard)
  JWT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
}

// ============================================================================
// Database Models
// ============================================================================

export interface User {
  id: string;
  apple_id: string;
  nickname: string | null;
  avatar_url: string | null;
  timezone: string;
  preferences: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Humidor {
  id: string;
  user_id: string;
  name: string;
  type: HumidorType;
  description: string | null;
  target_temperature_min: number;
  target_temperature_max: number;
  target_humidity_min: number;
  target_humidity_max: number;
  image_url: string | null;
  capacity: number | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export type HumidorType = 'cabinet' | 'cooler' | 'desktop' | 'travel';

export interface Cigar {
  id: string;
  humidor_id: string;
  brand: string;
  line: string | null;
  size: string | null;
  vitola: string | null;
  country: string | null;
  wrapper: string | null;
  binder: string | null;
  filler: string | null;
  strength: CigarStrength | null;
  quantity: number;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_location: string | null;
  image_url: string | null;
  flavor_notes: string | null; // JSON array
  personal_notes: string | null;
  rating: number | null;
  smoking_status: SmokingStatus;
  created_at: string;
  updated_at: string;
}

export type CigarStrength = 'mild' | 'medium' | 'full';
export type SmokingStatus = 'unsmoked' | 'partial' | 'finished';

export interface EnvironmentLog {
  id: string;
  humidor_id: string;
  temperature: number;
  humidity: number;
  logged_at: string;
  source: LogSource;
  device_id: string | null;
  note: string | null;
  created_at: string;
}

export type LogSource = 'manual' | 'sensor' | 'iot';

export interface Reminder {
  id: string;
  humidor_id: string;
  type: ReminderType;
  title: string | null;
  interval_days: number;
  next_at: string;
  last_notified_at: string | null;
  enabled: number;
  notification_time: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type ReminderType = 'check' | 'smoke' | 'rotate' | 'hydrate';

export interface SmokingSession {
  id: string;
  user_id: string;
  cigar_id: string;
  smoked_at: string;
  duration_minutes: number | null;
  pairing: string | null;
  location: string | null;
  weather: string | null;
  mood: string | null;
  draw_rating: number | null;
  burn_rating: number | null;
  ash_rating: number | null;
  flavor_rating: number | null;
  overall_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: string | null; // JSON
  read_at: string | null;
  created_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Auth
export interface AppleSignInRequest {
  identityToken: string;
  authorizationCode: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Humidor
export interface CreateHumidorRequest {
  name: string;
  type?: HumidorType;
  description?: string;
  target_temperature_min?: number;
  target_temperature_max?: number;
  target_humidity_min?: number;
  target_humidity_max?: number;
  capacity?: number;
}

export interface UpdateHumidorRequest extends Partial<CreateHumidorRequest> {
  image_url?: string;
  is_default?: boolean;
}

// Cigar
export interface CreateCigarRequest {
  brand: string;
  line?: string;
  size?: string;
  vitola?: string;
  country?: string;
  wrapper?: string;
  binder?: string;
  filler?: string;
  strength?: CigarStrength;
  quantity?: number;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  flavor_notes?: string[];
  personal_notes?: string;
  rating?: number;
}

export interface UpdateCigarRequest extends Partial<CreateCigarRequest> {
  image_url?: string;
  smoking_status?: SmokingStatus;
  quantity?: number;
}

// Environment Log
export interface CreateEnvironmentLogRequest {
  temperature: number;
  humidity: number;
  logged_at?: string;
  source?: LogSource;
  device_id?: string;
  note?: string;
}

// Reminder
export interface CreateReminderRequest {
  type: ReminderType;
  title?: string;
  interval_days: number;
  next_at?: string;
  notification_time?: string;
  note?: string;
}

export interface UpdateReminderRequest extends Partial<CreateReminderRequest> {
  enabled?: boolean;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface JwtPayload {
  sub: string; // user_id
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// ============================================================================
// Environment Statistics Types
// ============================================================================

export interface EnvironmentStats {
  humidor_id: string;
  avg_temperature: number;
  avg_humidity: number;
  min_temperature: number;
  max_temperature: number;
  min_humidity: number;
  max_humidity: number;
  readings_count: number;
  period_start: string;
  period_end: string;
}

export interface HumidorSummary extends Humidor {
  cigar_count: number;
  total_quantity: number;
  latest_temperature: number | null;
  latest_humidity: number | null;
  latest_log_at: string | null;
}