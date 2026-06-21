#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo ""
  echo "Example (local shell — do not commit credentials):"
  echo '  export DATABASE_URL="postgresql://user:pass@host:port/railway?sslmode=require"'
  echo "  ./scripts/railway-migrate.sh"
  exit 1
fi

echo "==> Deploying migrations to database..."
npx prisma migrate deploy

echo ""
echo "Migrations applied. Optional: seed demo data with ./scripts/railway-seed.sh"
