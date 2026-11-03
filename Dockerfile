FROM oven/bun:1.3.12 AS build

WORKDIR /app

COPY package.json bun.lock /app/

RUN bun install --frozen-lockfile

COPY . /app

# Empty on purpose: the app calls the API with relative paths so that the same
# image (same digest) works in every environment.
ARG VITE_API_URL=

RUN bun run build


FROM nginx:1.28-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
