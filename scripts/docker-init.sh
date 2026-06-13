#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
EXAMPLE="$ROOT/.env.staging.example"

if [[ -f "$ENV_FILE" ]]; then
  echo ".env already exists — skipping generation."
  exit 0
fi

cp "$EXAMPLE" "$ENV_FILE"

# Generate secrets if openssl is available
if command -v openssl >/dev/null 2>&1; then
  JWT=$(openssl rand -hex 32)
  REFRESH=$(openssl rand -hex 32)
  DB_PASS=$(openssl rand -hex 16)
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASS}|" "$ENV_FILE"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT}|" "$ENV_FILE"
  sed -i "s|^REFRESH_SECRET=.*|REFRESH_SECRET=${REFRESH}|" "$ENV_FILE"
  echo "Generated random POSTGRES_PASSWORD, JWT_SECRET, REFRESH_SECRET"
fi

echo ""
echo "Created .env from .env.staging.example"
echo "Edit PUBLIC_URL if deploying on a LAN IP (e.g. http://192.168.1.50)"
echo "Then run: make docker-up"
