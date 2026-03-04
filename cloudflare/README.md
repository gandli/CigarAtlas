# CigarAtlas API

Cloudflare Workers backend for CigarAtlas iOS app.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Vitest

## Project Structure

```
cloudflare/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── db/
│   │   └── index.ts       # Database access layer
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── users.ts       # User management routes
│   │   └── humidors.ts    # Humidor CRUD routes
│   ├── services/
│   │   └── apple-signin.ts # Apple Sign In verification
│   └── utils/
│       ├── jwt.ts         # JWT token utilities
│       └── validation.ts  # Input validation schemas
├── d1/
│   └── schema.sql         # Database schema
├── test/
│   └── index.test.ts      # Test suite
├── wrangler.toml          # Development configuration
├── wrangler.production.toml  # Production configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Installation

```bash
npm install
```

### Local Development

```bash
# Start local dev server
npm run dev
```

The API will be available at `http://localhost:8787`

### Database Setup

```bash
# Create D1 database (run once)
npm run db:create

# Apply schema locally
npm run db:query:local d1/schema.sql

# Or use migrations
npm run db:migrate:local
```

### R2 Bucket Setup

```bash
# Create R2 bucket (run once)
wrangler r2 bucket create cigaratlas-images

# For production
wrangler r2 bucket create cigaratlas-images-prod
```

### Deploy

```bash
# Deploy to development
npm run deploy

# Deploy to production
npm run deploy:prod
```

## API Documentation

### Base URL

```
Development: http://localhost:8787
Production: https://api.cigaratlas.com
```

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Response Format

All responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## Authentication Endpoints

### POST /v1/auth/apple

Authenticate user with Apple Sign In.

**Request Body:**

```json
{
  "identityToken": "string (required)",
  "authorizationCode": "string (optional)",
  "fullName": {
    "givenName": "string (optional)",
    "familyName": "string (optional)"
  }
}
```

**Response (200 - Existing user):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "apple_id": "001234.abc...",
      "nickname": "John Doe",
      "avatar_url": null,
      "timezone": "Asia/Shanghai",
      "created_at": "2026-03-04T00:00:00.000Z",
      "updated_at": "2026-03-04T00:00:00.000Z"
    }
  }
}
```

**Response (201 - New user):**

Same as above with HTTP status 201.

**Error Responses:**

- `400` - Validation error
- `401` - Invalid identity token
- `500` - Server error

---

### POST /v1/auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { /* User object */ }
  }
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Invalid or expired refresh token
- `404` - User not found

---

### POST /v1/auth/logout

Logout user (client should discard tokens).

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully. Please discard your tokens."
  }
}
```

---

## User Endpoints

### GET /v1/users/me

Get current authenticated user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "apple_id": "001234.abc...",
    "nickname": "John Doe",
    "avatar_url": "https://...",
    "timezone": "Asia/Shanghai",
    "preferences": null,
    "created_at": "2026-03-04T00:00:00.000Z",
    "updated_at": "2026-03-04T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `404` - User not found

---

### PATCH /v1/users/me

Update current user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "nickname": "string (optional, max 50 chars)",
  "avatar_url": "string (optional, valid URL)",
  "timezone": "string (optional, max 50 chars)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { /* Updated user object */ }
}
```

**Error Responses:**

- `400` - Validation error or no changes
- `401` - Missing or invalid token
- `404` - User not found

---

### DELETE /v1/users/me

Delete current user account (destructive).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully"
  }
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `500` - Delete failed

---

## Humidor Endpoints

All humidor endpoints require authentication.

### GET /v1/humidors

List all humidors for the current user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Humidor",
      "type": "cabinet",
      "description": "My collection",
      "target_temperature_min": 16.0,
      "target_temperature_max": 18.0,
      "target_humidity_min": 65.0,
      "target_humidity_max": 70.0,
      "image_url": null,
      "capacity": 100,
      "is_default": 1,
      "created_at": "2026-03-04T00:00:00.000Z",
      "updated_at": "2026-03-04T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `500` - Internal error

---

### GET /v1/humidors/:id

Get a specific humidor by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": { /* Humidor object */ }
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `403` - Forbidden (not owner)
- `404` - Humidor not found

---

### POST /v1/humidors

Create a new humidor.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "string (required, max 100 chars)",
  "type": "cabinet|cooler|desktop|travel (optional, default: cabinet)",
  "description": "string (optional, max 500 chars)",
  "target_temperature_min": "number (optional, -10 to 50, default: 16)",
  "target_temperature_max": "number (optional, -10 to 50, default: 18)",
  "target_humidity_min": "number (optional, 0 to 100, default: 65)",
  "target_humidity_max": "number (optional, 0 to 100, default: 70)",
  "capacity": "number (optional, integer, non-negative)"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { /* Created humidor object */ }
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Missing or invalid token
- `500` - Internal error

---

### PUT /v1/humidors/:id

Update a humidor (full update).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "string (optional, max 100 chars)",
  "type": "cabinet|cooler|desktop|travel (optional)",
  "description": "string (optional, max 500 chars)",
  "target_temperature_min": "number (optional, -10 to 50)",
  "target_temperature_max": "number (optional, -10 to 50)",
  "target_humidity_min": "number (optional, 0 to 100)",
  "target_humidity_max": "number (optional, 0 to 100)",
  "capacity": "number (optional, integer, non-negative)",
  "image_url": "string (optional, valid URL)",
  "is_default": "boolean (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { /* Updated humidor object */ }
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Missing or invalid token
- `403` - Forbidden (not owner)
- `404` - Humidor not found
- `500` - Update failed

---

### PATCH /v1/humidors/:id

Update a humidor (partial update).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

Same as PUT, all fields optional. Only provided fields will be updated.

**Response (200):**

```json
{
  "success": true,
  "data": { /* Updated humidor object */ }
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Missing or invalid token
- `403` - Forbidden (not owner)
- `404` - Humidor not found
- `500` - Update failed

---

### DELETE /v1/humidors/:id

Delete a humidor (cascade deletes all related cigars, logs, reminders).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Humidor deleted successfully"
  }
}
```

**Error Responses:**

- `401` - Missing or invalid token
- `403` - Forbidden (not owner)
- `404` - Humidor not found
- `500` - Delete failed

---

### Humidor Types

| Type | Description |
|------|-------------|
| `cabinet` | Large furniture-style humidor |
| `cooler` | Converted wine cooler/thermoelectric |
| `desktop` | Small tabletop humidor |
| `travel` | Portable travel humidor |

### Default Humidor Logic

- First humidor created is automatically set as default
- Only one humidor per user can be default at a time
- Setting a new default automatically unsets the previous one

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input data |
| `INVALID_JSON` | Malformed JSON body |
| `MISSING_TOKEN` | Authorization header missing |
| `INVALID_TOKEN` | Token invalid or expired |
| `USER_NOT_FOUND` | User record not found |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `NOT_FOUND` | Endpoint not found |
| `INTERNAL_ERROR` | Server error |

---

## Token Lifecycle

### Access Tokens
- **Validity**: 1 hour
- **Usage**: API requests
- **Refresh**: Use refresh token to get new access token

### Refresh Tokens
- **Validity**: 7 days
- **Usage**: Obtain new access tokens
- **Rotation**: New refresh token issued on each refresh

### Best Practices
1. Store tokens securely (Keychain on iOS)
2. Refresh access tokens before expiry
3. Handle 401 errors by prompting re-login
4. Clear tokens on logout

---

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Categories

- **Health Check Tests**: API info, health endpoints
- **JWT Utility Tests**: Token generation, verification
- **Input Validation Tests**: Request body validation
- **Authentication Tests**: Middleware, auth flow
- **Humidor Tests**: CRUD operations, ownership, validation
- **Security Tests**: SQL injection, XSS, error exposure

---

## Environment Variables

Create `.dev.vars` file (never commit this):

```bash
# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-here-min-32-chars

# Apple Sign In
APPLE_CLIENT_ID=com.cigaratlas.app
```

See `.dev.vars.example` for all available options.

---

## Database Schema

See `d1/schema.sql` for full schema definition.

### Main Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (Apple Sign In) |
| `humidors` | Humidor/cabinet records |
| `cigars` | Cigar inventory |
| `environment_logs` | Temperature/humidity logs |
| `reminders` | Care reminders |
| `smoking_sessions` | Tasting notes (future) |
| `user_notifications` | Push notifications (future) |

---

## Security Considerations

1. **JWT Tokens**: Use strong secrets (min 32 chars), rotate periodically
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure allowed origins for production
4. **Input Validation**: All inputs are validated with Zod schemas
5. **SQL Injection**: Using parameterized queries via D1
6. **Rate Limiting**: Consider adding rate limiting (not yet implemented)

---

## Development Roadmap

- [ ] Humidor CRUD endpoints
- [ ] Cigar inventory management
- [ ] Environment log tracking
- [ ] Reminder system
- [ ] Image upload (R2)
- [ ] Rate limiting
- [ ] Token blacklisting for logout
- [ ] WebSocket support for real-time updates

---

## License

MIT