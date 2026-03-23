# pinequest-s3-e2-team-9

Monorepo structure:

- `apps/web`: Next.js application
- `apps/api`: Express backend application
- `packages/ui`: shared UI package

## CI/CD

This repository now includes GitHub Actions workflows for CI and CD:

- `/.github/workflows/ci.yml`
  - Runs on pull requests and pushes to `main` and `develop`
  - Detects which monorepo apps changed
  - Runs separate jobs for `apps/web` and `apps/api`
  - Only executes the relevant app checks for the current changeset
- `/.github/workflows/deploy.yml`
  - Runs on pushes to `develop` and `main`, plus manual dispatch
  - Re-validates `web` and `api` in separate jobs before deployment
  - Deploys `develop` to the `staging` environment
  - Deploys `main` to the `production` environment
  - Uses each environment's own `DEPLOY_WEBHOOK_URL` secret

### Required GitHub configuration

Create these GitHub environments and add the same secret in each one:

- `staging`
  - `DEPLOY_WEBHOOK_URL`: staging deploy endpoint from Vercel, Render, Railway, your VPS, or another hosting provider
- `production`
  - `DEPLOY_WEBHOOK_URL`: production deploy endpoint from Vercel, Render, Railway, your VPS, or another hosting provider

### Suggested branch flow

- `develop`: integration branch that deploys to staging
- `main`: production branch that deploys to production
