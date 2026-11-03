# tesis-frontend

Frontend of the reference application: React, TypeScript, Vite and Playwright E2E tests.
Derived from [Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template) (MIT) — see [`NOTICE.md`](NOTICE.md) and [`CHANGES_FROM_TEMPLATE.md`](CHANGES_FROM_TEMPLATE.md).

The backend lives in [`tesis-backend`](https://github.com/tesis-entornos/tesis-backend).

## How the pieces fit

```
browser ──> edge ──┬── /api/*  ──> backend image
                   └── /*      ──> frontend image (nginx, static files)
```

The built app calls the API with **relative paths** (`/api/...`), so the same image works in every
environment. The edge is CloudFront in AWS and the `edge` nginx container (`e2e/edge.conf`) locally.

## Requirements

Docker with Compose v2. bun is optional (all scripts run it in Docker).

## E2E tests (Playwright)

Build the backend image first (in `tesis-backend`: `docker build -t tesis-backend:local .`), then:

```bash
./scripts/run-e2e.sh                                   # uses tesis-backend:local
BACKEND_IMAGE=<repo>@sha256:<digest> ./scripts/run-e2e.sh
```

While the stack is up the app is available at <http://localhost:8888> (`EDGE_PORT`).

## Development server

```bash
cp .env.example .env
bun install && bun run dev     # http://localhost:5173, API at VITE_API_URL (http://localhost:8000)
```

## API client

The client in `src/client` is generated from the backend's `openapi.json`:

```bash
./scripts/generate-client.sh <path-or-URL-to-openapi.json> <backend commit SHA>
```

`openapi.json`, `src/client/` and `src/client/SOURCE` (backend commit) are versioned together.
