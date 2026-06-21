#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-${RAILWAY_API_URL:-}}"
FRONTEND_URL="${2:-${RAILWAY_FRONTEND_URL:-}}"

if [[ -z "$API_URL" || -z "$FRONTEND_URL" ]]; then
  echo "Usage: $0 <api-base-url> <frontend-url>"
  echo ""
  echo "Examples:"
  echo "  $0 https://ingobyi-api.up.railway.app https://ingobyi-app.up.railway.app"
  echo ""
  echo "Or set RAILWAY_API_URL and RAILWAY_FRONTEND_URL."
  exit 1
fi

API_URL="${API_URL%/}"
FRONTEND_URL="${FRONTEND_URL%/}"

echo "==> Checking API health: ${API_URL}/api/health"
if curl -sf "${API_URL}/api/health" | python3 -m json.tool 2>/dev/null; then
  echo "    API: OK"
else
  echo "    API: FAILED"
  exit 1
fi

echo ""
echo "==> Checking frontend: ${FRONTEND_URL}/"
if curl -sf -o /dev/null -w "HTTP %{http_code}\n" "${FRONTEND_URL}/"; then
  echo "    Frontend: OK"
else
  echo "    Frontend: FAILED"
  exit 1
fi

echo ""
echo "All checks passed."
echo "  App:  ${FRONTEND_URL}"
echo "  API:  ${API_URL}/api"
echo "  Docs: ${API_URL}/api/docs (if ENABLE_SWAGGER=true)"
