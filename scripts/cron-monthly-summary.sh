#!/bin/bash
# scripts/cron-monthly-summary.sh
# Usage: ./cron-monthly-summary.sh <session_cookie_value>
# Or configure FITRACKER_SESSION_COOKIE in your env/cron environment.

COOKIE_VAL="${1:-$FITRACKER_SESSION_COOKIE}"

if [ -z "$COOKIE_VAL" ]; then
  echo "Error: Session cookie is required. Pass it as argument or set FITRACKER_SESSION_COOKIE."
  exit 1
fi

curl -s -X POST http://localhost:3000/api/reports/monthly-summary/run \
  -H "Cookie: fitracker_session=${COOKIE_VAL}" \
  -H "Content-Type: application/json"
