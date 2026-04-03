#!/bin/sh

set -eu

if [ -z "${AUTH_TOKEN:-}" ]; then
  echo "`AUTH_TOKEN` env variable шаардлагатай."
  exit 1
fi

if [ -z "${CLASS_ID:-}" ]; then
  echo "`CLASS_ID` env variable шаардлагатай."
  exit 1
fi

BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}"

echo "SSE stream-д холбогдож байна. `Ctrl+C` дарж зогсооно."
curl -N -sS \
  -H "accept: text/event-stream" \
  -H "authorization: Bearer $AUTH_TOKEN" \
  "$BASE_URL/events/classes/$CLASS_ID/exams"
