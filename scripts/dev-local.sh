#!/usr/bin/env bash
# Start Ingobyi Academy locally (no Docker required for app — only PostgreSQL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

free_port() {
  local port=$1
  local pids
  pids=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u || true)
  for pid in $pids; do
    if ps -p "$pid" -o comm= 2>/dev/null | grep -qE 'next-server|node'; then
      echo "Stopping stale process on port $port (pid $pid)..."
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
}

echo "==> Checking PostgreSQL..."
if ! pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  echo "PostgreSQL is not running on localhost:5432."
  echo "Start it with: cd backend && docker compose up -d postgres"
  echo "Or install and start PostgreSQL locally."
  exit 1
fi

echo "==> Checking backend dependencies..."
if [[ ! -d backend/node_modules ]]; then
  (cd backend && npm install)
fi
if [[ ! -d frontend/node_modules ]]; then
  (cd frontend && npm install)
fi

free_port 3000
free_port 3001

echo "==> Starting backend on http://localhost:3001 ..."
(cd backend && npm run start:dev) &
API_PID=$!

echo "==> Waiting for API..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
  echo "Backend failed to start. Check backend/.env and DATABASE_URL."
  kill $API_PID 2>/dev/null || true
  exit 1
fi

echo "==> Starting frontend on http://localhost:3000 ..."
(cd frontend && npm run dev) &
WEB_PID=$!

cleanup() {
  echo ""
  echo "Stopping..."
  kill $API_PID $WEB_PID 2>/dev/null || true
  wait $API_PID $WEB_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "Ingobyi Academy is running:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001/api"
echo "  Health:   http://localhost:3001/api/health"
echo "  Demo:     super@ingobyi.com / password123"
echo ""
echo "Press Ctrl+C to stop."

wait $WEB_PID
