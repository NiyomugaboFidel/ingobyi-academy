#!/usr/bin/env bash
# Docker Compose wrapper: plugin → bundled binary → legacy docker-compose
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLED="$ROOT/scripts/bin/docker-compose"

if docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi

if [[ -x "$BUNDLED" ]]; then
  exec "$BUNDLED" "$@"
fi

if command -v docker-compose >/dev/null 2>&1; then
  exec docker-compose "$@"
fi

echo "Error: Docker Compose not found."
echo "  Bundled binary missing? Run: curl -fsSL https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64 -o scripts/bin/docker-compose && chmod +x scripts/bin/docker-compose"
echo "  Or install system plugin: sudo apt install docker-compose-plugin"
exit 1
