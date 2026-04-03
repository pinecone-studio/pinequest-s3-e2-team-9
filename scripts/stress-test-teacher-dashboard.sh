#!/bin/sh

set -eu

if ! command -v k6 >/dev/null 2>&1; then
  echo "`k6` олдсонгүй. Эхлээд `k6` суулгана уу."
  exit 1
fi

if [ -z "${AUTH_TOKEN:-}" ]; then
  echo "`AUTH_TOKEN` env variable шаардлагатай."
  echo "Жишээ:"
  echo 'AUTH_TOKEN="your-bearer-token" npm run stress:test:teacher-dashboard'
  exit 1
fi

BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}"
VUS="${VUS:-10}"
DURATION="${DURATION:-20s}"
SLEEP_SECONDS="${SLEEP_SECONDS:-1}"
TMP_BODY="/tmp/pinequest-dashboard-overview-preflight.json"

cat >"$TMP_BODY" <<'EOF'
{"query":"query DashboardOverview { dashboardOverview { teacherName summary { pendingReviewCount draftExamCount ongoingExamCount scheduledExamCount } upcomingExams { id title scheduledFor questionCount status } recentResults { id title passCount failCount progressPercent averageScorePercent } } }"}
EOF

echo "Preflight: DashboardOverview auth шалгаж байна..."
PREFLIGHT_RESPONSE="$(curl -sS -X POST "$BASE_URL/graphql" \
  -H "content-type: application/json" \
  -H "authorization: Bearer $AUTH_TOKEN" \
  --data @"$TMP_BODY")"

case "$PREFLIGHT_RESPONSE" in
  *'"errors"'*)
    echo "Preflight амжилтгүй. Token хүчинтэй биш эсвэл GraphQL алдаа байна."
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
QUERY_FILE="apps/web/src/graphql/queries/dashboard-overview.graphql" \
OPERATION_NAME="DashboardOverview" \
VUS="$VUS" \
DURATION="$DURATION" \
SLEEP_SECONDS="$SLEEP_SECONDS" \
k6 run scripts/stress-test.k6.js
