#!/bin/sh

set -eu

if [ -z "${AUTH_TOKEN:-}" ]; then
  echo "`AUTH_TOKEN` env variable шаардлагатай."
  echo 'Жишээ: AUTH_TOKEN="your-bearer-token" npm run stress:test:teacher-dashboard:soak'
  exit 1
fi

AUTH_TOKEN="$AUTH_TOKEN" \
VUS="${VUS:-10}" \
DURATION="${DURATION:-5m}" \
SLEEP_SECONDS="${SLEEP_SECONDS:-1}" \
BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}" \
sh scripts/stress-test-teacher-dashboard.sh
