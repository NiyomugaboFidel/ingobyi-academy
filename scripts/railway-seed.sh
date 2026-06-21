#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI not found. Install: npm i -g @railway/cli"
  echo "Docs: https://docs.railway.app/develop/cli"
  exit 1
fi

echo "==> Seeding database via Railway (backend service)"
echo "    Link to your API/backend service if prompted."
echo ""

cd "$ROOT/backend"
railway run npm run prisma:seed

echo ""
echo "Demo accounts (password: password123):"
echo "  super@ingobyi.com"
echo "  student@ingobyi.com"
