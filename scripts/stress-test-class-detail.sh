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

VARIABLES_FILE="${VARIABLES_FILE:-scripts/class-detail.variables.example.json}"
BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}"
VUS="${VUS:-5}"
DURATION="${DURATION:-20s}"
SLEEP_SECONDS="${SLEEP_SECONDS:-1}"

VARIABLES_JSON="$(cat "$VARIABLES_FILE")"
PREFLIGHT_QUERY='query ClassDetail($id: ID!) { class(id: $id) { id name studentCount assignedExamCount upcomingExamCount completedExamCount averageScore teacher { id fullName } studentInsights { status averageScore suspiciousEventCount integrityRisk student { id fullName email } } examInsights { submittedCount totalStudents progressPercent averageScore questionCount exam { id title durationMinutes status createdAt scheduledFor startedAt endsAt } } } }'
PREFLIGHT_PAYLOAD="$(printf '{"query":"%s","variables":%s}' "$PREFLIGHT_QUERY" "$VARIABLES_JSON")"

echo "Preflight: ClassDetail auth шалгаж байна..."
PREFLIGHT_RESPONSE="$(curl -sS -X POST "$BASE_URL/graphql" \
  -H "content-type: application/json" \
  -H "authorization: Bearer $AUTH_TOKEN" \
  --data "$PREFLIGHT_PAYLOAD")"

case "$PREFLIGHT_RESPONSE" in
  *'"errors"'*)
    echo "Preflight амжилтгүй. Token, class id, эсвэл GraphQL алдаа байна."
    echo "$PREFLIGHT_RESPONSE"
    exit 1
    ;;
  *'"data"'*)
    echo "Preflight амжилттай. `k6` тест эхэлж байна..."
    ;;
  *)
    echo "Preflight хариу ойлгогдохгүй байна:"
    echo "$PREFLIGHT_RESPONSE"
    exit 1
    ;;
esac

BASE_URL="$BASE_URL" \
AUTH_TOKEN="$AUTH_TOKEN" \
QUERY_FILE="apps/web/src/graphql/queries/class-detail.graphql" \
VARIABLES_FILE="$VARIABLES_FILE" \
OPERATION_NAME="ClassDetail" \
VUS="$VUS" \
DURATION="$DURATION" \
SLEEP_SECONDS="$SLEEP_SECONDS" \
k6 run scripts/stress-test.k6.js
