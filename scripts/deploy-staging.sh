#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.staging.example..."
  cp .env.staging.example .env
  echo ""
  echo "IMPORTANT: Edit .env before continuing:"
  echo "  - PUBLIC_URL and FRONTEND_URL (your server IP or hostname)"
  echo "  - POSTGRES_PASSWORD, JWT_SECRET, REFRESH_SECRET"
  echo ""
  read -r -p "Press Enter after editing .env, or Ctrl+C to abort..."
fi

# shellcheck disable=SC1091
source .env

if [[ "$JWT_SECRET" == replace-with-* ]] || [[ "$POSTGRES_PASSWORD" == change-me-* ]]; then
  echo "Error: Update JWT_SECRET and POSTGRES_PASSWORD in .env"
  exit 1
fi

echo "==> Building and starting services..."
docker compose up -d --build

echo "==> Waiting for API health..."
for i in $(seq 1 30); do
  if curl -sf "${PUBLIC_URL}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -sf "${PUBLIC_URL}/api/health" >/dev/null 2>&1; then
  echo "Warning: API not healthy yet. Check: docker compose logs api"
else
  echo "API is healthy."
fi

if [[ "${RUN_SEED:-false}" == "true" ]]; then
  echo "==> RUN_SEED=true — seed runs on api container start."
else
  echo ""
  echo "To load demo users and sample data (first time only):"
  echo "  docker compose --profile seed run --rm seed"
fi

echo ""
echo "Staging is up:"
echo "  App:     ${PUBLIC_URL}"
echo "  API:     ${PUBLIC_URL}/api"
echo "  Health:  ${PUBLIC_URL}/api/health"
if [[ "${ENABLE_SWAGGER:-false}" == "true" ]]; then
  echo "  Swagger: ${PUBLIC_URL}/api/docs"
fi
echo ""
echo "Demo accounts (after seed): super@ingobyi.com / password123"
echo "Logs: docker compose logs -f"
