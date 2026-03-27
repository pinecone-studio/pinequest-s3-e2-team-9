# Environment Data Setup

## Goal

Keep feature development predictable:

- `prod` uses the real production database
- `local` and `preview` use the same shared non-production D1 dataset by default
- isolated local sandbox mode stays available, but only when explicitly requested

## Default workflow

### Web

```bash
npm run dev
```

The web app uses `apps/web/.env.local` and talks to the local API at `http://127.0.0.1:8787/graphql`.

### API

```bash
npm run dev:api
```

This starts Wrangler in `--remote` mode with `apps/api/wrangler.dev.toml`, so local development reads the shared dev D1 database instead of a private empty sandbox.

## Isolated local sandbox

Use this only when you intentionally want disposable data:

```bash
npm run dev:api:local
```

Useful companion commands:

```bash
npm run db:migrate:local --workspace @pinequest/api
npm run db:seed:local --workspace @pinequest/api
```

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

CI preview deploys the API from `apps/api/wrangler.dev.toml`, so preview and local default to the same non-production data source.

This is intentional. It gives the team stable parity between:

- local development
- PR preview
- shared review data

Production remains isolated and should not be used as a development data source.
