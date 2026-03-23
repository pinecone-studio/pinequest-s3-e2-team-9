# pinequest-s3-e2-team-9

Monorepo structure:

- `apps/web`: Next.js application
- `apps/api`: Express backend application
- `packages/ui`: shared UI package

## CI/CD

This repository now uses GitHub Actions for CI and provider-native CD:

- `/.github/workflows/ci.yml`
  - Runs on pull requests and pushes to `main` and `develop`
  - Detects which monorepo apps changed
  - Runs separate jobs for `apps/web` and `apps/api`
  - Only executes the relevant app checks for the current changeset
- `/render.yaml`
  - Defines Render services for the API staging and production environments
  - Waits for CI checks to pass before deploying the linked branch
  - Limits API deploys to backend-related file changes

### Web deployment with Vercel

Connect the repository to a Vercel project for `apps/web`:

1. Import the GitHub repository in Vercel
2. Set the project root directory to `apps/web`
3. Confirm the production branch is `main`
4. Keep `Include source files outside of the Root Directory` enabled so `packages/ui` is available during builds

After that, Vercel will automatically:

- create a preview deployment URL for each pull request
- add the preview URL to the GitHub pull request
- deploy `main` to the production domain

Set these Vercel environment variables for the web app:

- `Preview`
  - `NEXT_PUBLIC_API_BASE_URL=https://your-staging-api.onrender.com`
- `Production`
  - `NEXT_PUBLIC_API_BASE_URL=https://your-production-api.onrender.com`
- `Development`
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

The web app reads this variable to decide which API base URL to call in each environment.

### API deployment with Render

Use the root-level `render.yaml` blueprint to create two Render services:

- `pinequest-api-staging`
  - branch: `develop`
  - root directory: `apps/api`
- `pinequest-api-production`
  - branch: `main`
  - root directory: `apps/api`

Suggested setup flow:

1. Connect the GitHub repository to Render
2. Create a Blueprint from `render.yaml`
3. Add the required API environment variables in Render for both services
4. Keep `autoDeployTrigger` as `checksPass` so Render deploys only after GitHub checks succeed

### Suggested branch flow

- `develop`: integration branch that deploys the API to Render staging
- `main`: production branch that deploys the API to Render production and the web app to Vercel production
- pull requests: Vercel creates preview URLs for the web app automatically
