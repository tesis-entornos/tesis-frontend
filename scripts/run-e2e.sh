#! /usr/bin/env sh
# Runs the Playwright E2E tests against a backend image and a frontend image.
# Extra arguments are passed to `playwright test`.
#
#   BACKEND_IMAGE   default tesis-backend:local (build it in tesis-backend)
#   FRONTEND_IMAGE  if unset, tesis-frontend:local is built from this repository;
#                   if set (e.g. <registry>/<repo>@sha256:<digest>) it is used as is:
#                   nothing is built or rebuilt, and it is pulled only if missing.
#   E2E_RUN_DIR     where this run's metadata.json and results.json are written
#                   (default e2e-runs/<UTC timestamp>)

set -e

# Fresh secrets for every run: the backend runs in production mode and
# rejects the "changethis" defaults. Override them by exporting E2E_*.
E2E_SECRET_KEY="${E2E_SECRET_KEY:-$(openssl rand -hex 32)}"
E2E_POSTGRES_PASSWORD="${E2E_POSTGRES_PASSWORD:-$(openssl rand -hex 16)}"
E2E_SUPERUSER_PASSWORD="${E2E_SUPERUSER_PASSWORD:-$(openssl rand -hex 16)}"
export E2E_SECRET_KEY E2E_POSTGRES_PASSWORD E2E_SUPERUSER_PASSWORD

BACKEND_IMAGE="${BACKEND_IMAGE:-tesis-backend:local}"
if [ -z "${FRONTEND_IMAGE:-}" ]; then
  FRONTEND_IMAGE=tesis-frontend:local
  BUILD_FRONTEND=1
fi
export BACKEND_IMAGE FRONTEND_IMAGE

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
E2E_RUN_DIR="${E2E_RUN_DIR:-e2e-runs/$RUN_ID}"
mkdir -p "$E2E_RUN_DIR"

compose() { docker compose -f compose.e2e.yml "$@"; }

# JSON string (escapes backslashes and double quotes)
jstr() { printf '"%s"' "$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')"; }

# Image actually used by a service's container, plus its registry digests
image_json() {
  service="$1"; ref="$2"
  container="$(compose ps -a -q "$service" | head -n 1)"
  id="$(docker inspect -f '{{.Image}}' "$container")"
  repo_digests="$(docker image inspect -f '{{json .RepoDigests}}' "$id" 2>/dev/null || echo null)"
  printf '{"ref": %s, "image_id": %s, "repo_digests": %s}' \
    "$(jstr "$ref")" "$(jstr "$id")" "$repo_digests"
}

set -x

if [ -n "${BUILD_FRONTEND:-}" ]; then
  docker build -t "$FRONTEND_IMAGE" .
fi
# Only the test runner is built; application images are used as given
compose build playwright
compose down -v --remove-orphans
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
compose up -d --wait edge
compose run --rm playwright bunx playwright test "$@" || status=$?
FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

set +x
cp test-results/results.json "$E2E_RUN_DIR/results.json" 2>/dev/null || true
git_dirty=false
git diff --quiet HEAD 2>/dev/null || git_dirty=true
{
  printf '{\n'
  printf '  "run_id": %s,\n' "$(jstr "$RUN_ID")"
  printf '  "started_at": %s,\n' "$(jstr "$STARTED_AT")"
  printf '  "finished_at": %s,\n' "$(jstr "$FINISHED_AT")"
  printf '  "exit_status": %s,\n' "${status:-0}"
  printf '  "playwright_args": %s,\n' "$(jstr "$*")"
  printf '  "playwright_workers": %s,\n' "$(jstr "${PLAYWRIGHT_WORKERS:-}")"
  printf '  "playwright_retries": %s,\n' "$(jstr "${PLAYWRIGHT_RETRIES:-0}")"
  printf '  "frontend_commit": %s,\n' "$(jstr "$(git rev-parse HEAD 2>/dev/null)")"
  printf '  "frontend_worktree_dirty": %s,\n' "$git_dirty"
  printf '  "client_source": %s,\n' "$(jstr "$(cat src/client/SOURCE 2>/dev/null)")"
  printf '  "backend_image": %s,\n' "$(image_json backend "$BACKEND_IMAGE")"
  printf '  "frontend_image": %s,\n' "$(image_json frontend "$FRONTEND_IMAGE")"
  printf '  "frontend_image_built_by_this_run": %s,\n' "$([ -n "${BUILD_FRONTEND:-}" ] && echo true || echo false)"
  printf '  "results": %s\n' "$(jstr "$E2E_RUN_DIR/results.json")"
  printf '}\n'
} > "$E2E_RUN_DIR/metadata.json"
echo "Run metadata: $E2E_RUN_DIR/metadata.json"
set -x

compose down -v --remove-orphans
exit ${status:-0}
