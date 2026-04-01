# Environment Data Setup

## Goal

Keep feature development predictable:

- `prod` uses the real production database
- the whole team uses one shared non-production D1 dataset for daily work
- `preview` uses that same shared dataset by default
- local sandbox mode is removed from the normal setup to avoid team drift

## Default workflow

This is the only setup the team should use day to day:

- `npm run dev:api`
- `npm run dev`

If everyone uses the same branch, the same login account, and the commands above, everyone sees the same data.

### Web

```bash
npm run dev
```

The web app uses `apps/web/.env.local` and talks to the local API at `http://localhost:8787/graphql`.

### API

```bash
npm run dev:api
```

This starts Wrangler in `--remote` mode with the default `apps/api/wrangler.toml` config, so local development reads the shared dev D1 database instead of a private sandbox.

## Optional PDF extraction service

If you want PDF import to run through a separate local service instead of browser-side fallback, start:

```bash
npm run dev:pdf-service
```

Then point the API at it in `apps/api/.dev.vars`:

```bash
PDF_EXTRACTION_SERVICE_URL=http://127.0.0.1:8788/extract
PDF_EXTRACTION_SERVICE_TOKEN=choose-a-shared-secret
```

Start the service with the same shared secret in its own shell:

```bash
PORT=8788
PDF_EXTRACTION_SERVICE_TOKEN=choose-a-shared-secret
npm run dev:pdf-service
```

This service is intentionally MVP-only:

- selectable text PDF: supported
- OCR / scanned PDF: not handled by the service
- when the service is not configured, the web app still falls back to client-side extraction

## Shared dev database maintenance

When the schema changes, apply migrations to the shared dev database:

```bash
npm run db:migrate:dev --workspace @pinequest/api
```

If you need to re-apply the baseline seed for the shared dev database:

```bash
npm run db:seed:dev --workspace @pinequest/api
```

## Preview behavior

CI preview deploys the API from the default `apps/api/wrangler.toml`, so preview and local default to the same non-production data source.

This is intentional. It gives the team stable parity between:

- local development
- PR preview
- shared review data

Production remains isolated and should not be used as a development data source.

## Production deployment

The same Wrangler config file also contains the production environment.

- local development uses the default shared dev bindings
- production deploys use `--env production`

This keeps one source of truth for configuration while still isolating production data.

## R2 image uploads

The API now expects private R2 buckets for image-answer uploads:

- `pinequest-uploads` for production
- `pinequest-uploads-preview` for shared dev / preview

Before using image upload locally or in preview, create those buckets in Cloudflare R2. The API stores only the R2 object key in D1, and the web app fetches the image back through authenticated API routes.
