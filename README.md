# CigarAtlas

Community app for cigar enthusiasts: tasting journal, social circles, local meetups, and humidor management.

## Positioning

CigarAtlas is a consumer-facing platform focused on cigar lifestyle: tasting records, social interaction, local meetups, and humidor routines.

## Scope (MVP)

- Community feed
- Tasting journal
- Local meetup board
- User profile and badges

## Architecture

| Layer | Stack | Location |
|-------|-------|----------|
| API backend | Cloudflare Workers + Hono | [`cloudflare/`](cloudflare/) |
| Database | Cloudflare D1 (SQLite) | [`cloudflare/d1/`](cloudflare/d1/) |
| Auth | JWT middleware | [`cloudflare/src/middleware/auth.ts`](cloudflare/src/middleware/auth.ts) |
| API spec | OpenAPI | [`docs/api/openapi.yaml`](docs/api/openapi.yaml) |

## Backend Quick Start

```bash
cd cloudflare
bun install

# Local dev server
bun run dev

# Apply D1 migrations locally
bun run db:migrate:local

# Run tests
bun run test
```

## Deploy

```bash
cd cloudflare
bun run deploy        # staging
bun run deploy:prod   # production
```

## Documentation

- [PRD (MVP)](docs/PRD-v1-MVP.md)
- [Market Research Report](docs/Market-Research-Report.md)
- [MVP Design Plan](docs/plans/2026-03-04-mvp-design.md)
- [Humidor API](cloudflare/docs/HUMIDOR_API.md)
