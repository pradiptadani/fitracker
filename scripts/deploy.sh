#!/usr/bin/env bash
# Redeploy FiTracker. Run from anywhere.
#   ./scripts/deploy.sh           rebuild + restart app (keeps DB & data)
#   ./scripts/deploy.sh --migrate rebuild + restart + apply new Prisma migrations
#   ./scripts/deploy.sh --pull    git pull first, then rebuild + restart
# Flags combine: ./scripts/deploy.sh --pull --migrate
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

COMPOSE="docker-compose -f docker-compose.yml -f docker-compose.prod.yml"
NETWORK="fitracker_default"

DO_PULL=false
DO_MIGRATE=false
for arg in "$@"; do
  case "$arg" in
    --pull)    DO_PULL=true ;;
    --migrate) DO_MIGRATE=true ;;
    *) echo "unknown flag: $arg"; exit 1 ;;
  esac
done

if $DO_PULL; then
  echo "==> git pull"
  git pull --ff-only
fi

echo "==> build + (re)start"
$COMPOSE up -d --build

if $DO_MIGRATE; then
  echo "==> waiting for db"
  until docker exec fitracker-db-1 pg_isready -U fitracker >/dev/null 2>&1; do sleep 1; done
  echo "==> prisma migrate deploy"
  docker run --rm --network "$NETWORK" -v "$PWD":/app -w /app \
    node:20-alpine sh -c "npx prisma migrate deploy"
fi

echo "==> health check"
sleep 4
code=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3015/dashboard || echo 000)
echo "    dashboard -> $code"
if [ "$code" = "200" ]; then
  echo "==> deploy OK  (http://localhost:3015)"
else
  echo "!!  unexpected status $code — recent app logs:"
  docker logs --tail 30 fitracker-app-1
  exit 1
fi
