#!/usr/bin/env bash
set -euo pipefail

echo "Ingobyi Academy — Docker prerequisites"
echo ""

ok=true

if command -v docker >/dev/null 2>&1; then
  echo "✓ docker: $(docker --version)"
else
  echo "✗ docker not found"
  ok=false
fi

if docker info >/dev/null 2>&1; then
  echo "✓ docker daemon accessible"
else
  echo "✗ cannot access docker daemon (run: sudo usermod -aG docker \$USER && re-login)"
  ok=false
fi

if docker compose version >/dev/null 2>&1; then
  echo "✓ docker compose: $(docker compose version --short 2>/dev/null || docker compose version)"
elif command -v docker-compose >/dev/null 2>&1; then
  echo "✓ docker-compose: $(docker-compose --version)"
else
  echo "✗ docker compose not found (run: sudo apt install docker-compose-plugin)"
  ok=false
fi

if [[ -f .env ]]; then
  echo "✓ .env exists"
else
  echo "○ .env missing — run: make docker-init"
fi

echo ""
if $ok; then
  echo "Ready. Run: make docker-up"
else
  echo "Fix the items above, then run: make docker-up"
  exit 1
fi
