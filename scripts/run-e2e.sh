#! /usr/bin/env sh
# Runs the Playwright E2E tests against a backend image and the frontend image.
# Extra arguments are passed to `playwright test`.

set -e
set -x

docker compose -f compose.e2e.yml build
docker compose -f compose.e2e.yml down -v --remove-orphans
docker compose -f compose.e2e.yml up -d --wait edge
docker compose -f compose.e2e.yml run --rm playwright bunx playwright test --reporter=list "$@" || status=$?
docker compose -f compose.e2e.yml down -v --remove-orphans
exit ${status:-0}
