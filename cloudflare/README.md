# CigarAtlas API

Cloudflare Workers backend for CigarAtlas iOS app.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Language**: TypeScript

## Project Structure

```
cloudflare/
├── src/
│   ├── index.ts      # Main entry point & routes
│   └── types.ts      # TypeScript type definitions
├── d1/
│   └── schema.sql    # Database schema
├── wrangler.toml     # Development configuration
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

## API Endpoints

### Auth
- `POST /v1/auth/apple` - Apple Sign In
- `POST /v1/auth/refresh` - Refresh tokens
- `POST /v1/auth/logout` - Logout

### Users
- `GET /v1/users/me` - Get current user
- `PATCH /v1/users/me` - Update profile

### Humidors
- `GET /v1/humidors` - List user's humidors
- `POST /v1/humidors` - Create humidor
- `GET /v1/humidors/:id` - Get humidor details
- `PUT /v1/humidors/:id` - Update humidor
- `DELETE /v1/humidors/:id` - Delete humidor

### Cigars
- `GET /v1/humidors/:humidorId/cigars` - List cigars
- `POST /v1/humidors/:humidorId/cigars` - Add cigar
- `GET /v1/cigars/:id` - Get cigar details
- `PUT /v1/cigars/:id` - Update cigar
- `DELETE /v1/cigars/:id` - Delete cigar

### Environment Logs
- `GET /v1/humidors/:humidorId/logs` - List logs
- `POST /v1/humidors/:humidorId/logs` - Create log
- `GET /v1/humidors/:humidorId/logs/stats` - Statistics

### Reminders
- `GET /v1/humidors/:humidorId/reminders` - List reminders
- `POST /v1/humidors/:humidorId/reminders` - Create reminder
- `PUT /v1/reminders/:id` - Update reminder
- `DELETE /v1/reminders/:id` - Delete reminder

### Images
- `POST /v1/images/upload` - Upload image to R2
- `GET /v1/images/:key` - Get image from R2

## Environment Variables

Create `.dev.vars` file (never commit this):

```
JWT_SECRET=your-secure-jwt-secret
APPLE_CLIENT_ID=com.cigaratlas.app
```

## Database Schema

See `d1/schema.sql` for full schema definition.

Main tables:
- `users` - User accounts (Apple Sign In)
- `humidors` - Humidor/cabinet records
- `cigars` - Cigar inventory
- `environment_logs` - Temperature/humidity logs
- `reminders` - Care reminders
- `smoking_sessions` - Tasting notes (future)
- `user_notifications` - Push notifications (future)