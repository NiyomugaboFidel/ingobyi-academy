#!/usr/bin/env bash
# Use Docker Compose v2 plugin, fall back to docker-compose v1.
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi

if command -v docker-compose >/dev/null 2>&1; then
  exec docker-compose "$@"
fi

echo "Error: Docker Compose is not installed."
echo "Install: sudo apt install docker-compose-plugin"
echo "Or:     sudo apt install docker-compose"
exit 1
