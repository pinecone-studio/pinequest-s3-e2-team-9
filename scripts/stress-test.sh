#!/bin/sh

set -eu

BASE_URL="${BASE_URL:-https://pinequest-api.b94889340.workers.dev}"
HEALTH_REQUESTS="${HEALTH_REQUESTS:-1000}"
HEALTH_CONCURRENCY="${HEALTH_CONCURRENCY:-50}"
GRAPHQL_REQUESTS="${GRAPHQL_REQUESTS:-400}"
GRAPHQL_CONCURRENCY="${GRAPHQL_CONCURRENCY:-20}"
TMP_BODY="/tmp/pinequest-stress-health-query.json"

if ! command -v ab >/dev/null 2>&1; then
  echo "ApacheBench (`ab`) олдсонгүй. macOS дээр ApacheBench суусан эсэхийг шалгана уу."
  exit 1
fi

cat >"$TMP_BODY" <<'EOF'
{"query":"query { health { ok service runtime } }"}
EOF

echo ""
echo "== Pinequest stress test =="
echo "Үндсэн URL: $BASE_URL"
echo "Health:   $HEALTH_REQUESTS хүсэлт, concurrency $HEALTH_CONCURRENCY"
echo "GraphQL:  $GRAPHQL_REQUESTS хүсэлт, concurrency $GRAPHQL_CONCURRENCY"
echo ""
echo "1) GET /health тест"
ab -n "$HEALTH_REQUESTS" -c "$HEALTH_CONCURRENCY" "$BASE_URL/health"
echo ""
echo "2) POST /graphql тест"
ab -n "$GRAPHQL_REQUESTS" -c "$GRAPHQL_CONCURRENCY" -p "$TMP_BODY" -T application/json "$BASE_URL/graphql"
