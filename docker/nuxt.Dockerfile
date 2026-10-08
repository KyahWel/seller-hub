# syntax=docker/dockerfile:1
#   docker build -f docker/nuxt.Dockerfile .

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS build
ENV NX_DAEMON=false NX_NO_CLOUD=true
WORKDIR /workspace
COPY . .
RUN npm ci
RUN npx nx build @org/web

# Nitro's .output is self-contained — no node_modules needed.
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /workspace/apps/web/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
