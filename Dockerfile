# Base images are pinned by digest (multi-arch index); the tag is kept for readability.
FROM oven/bun:1.3.12@sha256:8956c7667fa17beb6e3c664115e66bdacfe502da5d99603626e74c197bdef160 AS build

WORKDIR /app

COPY package.json bun.lock /app/

RUN bun install --frozen-lockfile

COPY . /app

# Empty on purpose: the app calls the API with relative paths so that the same
# image (same digest) works in every environment.
ARG VITE_API_URL=

RUN bun run build


FROM nginx:1.28-alpine@sha256:a8b39bd9cf0f83869a2162827a0caf6137ddf759d50a171451b335cecc87d236

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
