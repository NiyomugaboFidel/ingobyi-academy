#!/usr/bin/env bash
set -euo pipefail

echo "Ingobyi Academy — Docker prerequisites"
echo ""

ok=true

if command -v docker >/dev/null 2>&1; then
  echo "✓ docker: $(docker --version)"
else
  echo "✗ docker not found — install: sudo apt install docker.io"
  ok=false
fi

if docker info >/dev/null 2>&1; then
  echo "✓ docker daemon accessible"
elif groups | grep -q docker; then
  echo "✗ docker daemon not accessible (you are in 'docker' group — try: newgrp docker)"
  ok=false
else
  echo "✗ docker permission denied"
  echo "  Fix: sudo usermod -aG docker \$USER"
  echo "  Then log out and back in, or run: newgrp docker"
  ok=false
fi

if docker compose version >/dev/null 2>&1; then
  echo "✓ docker compose: $(docker compose version --short 2>/dev/null || docker compose version)"
elif [[ -x scripts/bin/docker-compose ]]; then
  echo "✓ bundled compose: $(scripts/bin/docker-compose version --short)"
elif command -v docker-compose >/dev/null 2>&1; then
  echo "✓ docker-compose: $(docker-compose --version)"
else
  echo "✗ docker compose not found"
  echo "  Install: sudo apt install docker-compose-plugin"
  echo "  Or download to scripts/bin/docker-compose (see DEPLOY.md)"
  ok=false
fi

if [[ -f .env ]]; then
  echo "✓ .env exists"
else
  echo "○ .env missing — run: make docker-init"
fi

echo ""
if $ok; then
  echo "Docker ready. Run: make docker-up"
else
  echo "Docker not ready. For local dev without Docker app containers:"
  echo "  ./scripts/dev-local.sh"
  exit 1
fi
