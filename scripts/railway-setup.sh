#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Ingobyi Academy — Railway testing setup                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Deploy as TWO separate Railway services (never one combined script):"
echo "  1. backend/  → API + migrations on start"
echo "  2. frontend/ → Next.js"
echo "  3. PostgreSQL plugin (shared DATABASE_URL)"
echo ""
echo "Full guide: ${ROOT}/RAILWAY.md"
echo ""

if ! command -v railway >/dev/null 2>&1; then
  echo "Optional: install Railway CLI for logs and seeding:"
  echo "  npm i -g @railway/cli && railway login"
  echo ""
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "Warning: openssl not found — generate secrets manually for JWT_SECRET / REFRESH_SECRET"
else
  echo "Suggested secrets (copy into Railway backend variables):"
  echo "  JWT_SECRET=$(openssl rand -hex 32)"
  echo "  REFRESH_SECRET=$(openssl rand -hex 32)"
  echo ""
fi

echo "Backend variables template:  backend/.env.railway.example"
echo "Frontend variables template: frontend/.env.railway.example"
echo ""
echo "Deploy order:"
echo "  1. Add PostgreSQL plugin"
echo "  2. Deploy backend (root: backend) → generate domain → set variables"
echo "  3. Deploy frontend (root: frontend) → set NEXT_PUBLIC_* → generate domain"
echo "  4. Update backend FRONTEND_URL to frontend domain → redeploy API"
echo "  5. Seed once: ./scripts/railway-seed.sh"
echo "  6. Verify:   ./scripts/railway-health.sh https://api... https://app..."
echo ""

if command -v railway >/dev/null 2>&1; then
  read -r -p "Link Railway CLI to backend service now? [y/N] " link
  if [[ "${link,,}" == "y" ]]; then
    cd "$ROOT/backend"
    railway link
    echo ""
    echo "Linked. Useful commands:"
    echo "  railway logs"
    echo "  railway run npm run prisma:seed"
    echo "  railway variables"
  fi
fi
