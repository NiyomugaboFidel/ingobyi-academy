#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

./scripts/docker-init.sh

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

if [[ "${JWT_SECRET:-}" == replace-with-* ]] || [[ "${POSTGRES_PASSWORD:-}" == change-me-* ]]; then
  echo "Run ./scripts/docker-init.sh or set JWT_SECRET and POSTGRES_PASSWORD in .env"
  exit 1
fi

COMPOSE="$ROOT/scripts/compose.sh"

echo "==> Building and starting Ingobyi Academy..."
"$COMPOSE" up -d --build

echo "==> Waiting for services..."
for i in $(seq 1 60); do
  if curl -sf "${PUBLIC_URL:-http://localhost}/api/health" >/dev/null 2>&1; then
    echo ""
    echo "Ready!"
    echo "  App:    ${PUBLIC_URL:-http://localhost}"
    echo "  API:    ${PUBLIC_URL:-http://localhost}/api/health"
    if [[ "${ENABLE_SWAGGER:-false}" == "true" ]]; then
      echo "  Docs:   ${PUBLIC_URL:-http://localhost}/api/docs"
    fi
    echo ""
    echo "First time? Load demo users:"
    echo "  ./scripts/compose.sh --profile seed run --rm seed"
    echo ""
    echo "Demo login: super@ingobyi.com / password123"
    exit 0
  fi
  printf "."
  sleep 3
done

echo ""
echo "Stack started but health check timed out. Inspect logs:"
echo "  ./scripts/compose.sh logs -f api web nginx"
exit 1
