#! /usr/bin/env sh
# Regenerates src/client from a backend OpenAPI schema.
#
#   ./scripts/generate-client.sh <openapi.json path or URL> <backend git commit SHA>
#
# The schema is copied to ./openapi.json and versioned together with src/client.
# src/client/SOURCE records which backend commit the client was generated from.

set -e

if [ $# -ne 2 ]; then
  echo "usage: $0 <openapi.json path or URL> <backend commit SHA>" >&2
  exit 2
fi

case "$1" in
  http://*|https://*) curl -fsSL "$1" -o openapi.json ;;
  *) cp "$1" openapi.json ;;
esac

docker run --rm -v "$PWD":/app -w /app oven/bun:1.3.12 sh -c \
  "bun install --frozen-lockfile && bun run generate-client && bun run lint"

printf 'backend_commit=%s\n' "$2" > src/client/SOURCE
echo "client generated from backend commit $2"
