#!/bin/sh

set -eu

if ! command -v k6 >/dev/null 2>&1; then
  echo "`k6` олдсонгүй. Эхлээд `k6` суулгана уу."
  exit 1
fi

if [ -z "${AUTH_TOKEN:-}" ]; then
  echo "`AUTH_TOKEN` env variable шаардлагатай."
  exit 1
fi

VARIABLES_FILE="${VARIABLES_FILE:-scripts/save-answer.variables.example.json}"
BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}"
VUS="${VUS:-2}"
DURATION="${DURATION:-10s}"
SLEEP_SECONDS="${SLEEP_SECONDS:-1}"

echo "Анхаар: `SaveAnswer` бол write path. Production биш, туршилтын attempt/question дээр ашиглана уу."

BASE_URL="$BASE_URL" \
AUTH_TOKEN="$AUTH_TOKEN" \
QUERY_FILE="apps/web/src/graphql/mutations/save-answer.graphql" \
VARIABLES_FILE="$VARIABLES_FILE" \
OPERATION_NAME="SaveAnswer" \
VUS="$VUS" \
DURATION="$DURATION" \
SLEEP_SECONDS="$SLEEP_SECONDS" \
k6 run scripts/stress-test.k6.js
