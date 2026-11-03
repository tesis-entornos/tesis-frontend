#! /usr/bin/env sh
# Runs the Playwright E2E tests against a backend image and the frontend image.
# Extra arguments are passed to `playwright test`.

set -e

# Fresh secrets for every run: the backend runs in production mode and
# rejects the "changethis" defaults. Override them by exporting E2E_*.
E2E_SECRET_KEY="${E2E_SECRET_KEY:-$(openssl rand -hex 32)}"
E2E_POSTGRES_PASSWORD="${E2E_POSTGRES_PASSWORD:-$(openssl rand -hex 16)}"
E2E_SUPERUSER_PASSWORD="${E2E_SUPERUSER_PASSWORD:-$(openssl rand -hex 16)}"
export E2E_SECRET_KEY E2E_POSTGRES_PASSWORD E2E_SUPERUSER_PASSWORD

set -x

docker compose -f compose.e2e.yml build
docker compose -f compose.e2e.yml down -v --remove-orphans
docker compose -f compose.e2e.yml up -d --wait edge
docker compose -f compose.e2e.yml run --rm playwright bunx playwright test --reporter=list "$@" || status=$?
docker compose -f compose.e2e.yml down -v --remove-orphans
exit ${status:-0}
