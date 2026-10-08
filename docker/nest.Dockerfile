# syntax=docker/dockerfile:1
# Builds any NestJS app in apps/ — pass its folder name as APP:
#   docker build -f docker/nest.Dockerfile --build-arg APP=api-gateway .

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS build
ARG APP
ENV NX_DAEMON=false NX_NO_CLOUD=true
WORKDIR /workspace
COPY . .
RUN npm ci
# `prune` builds the app and writes a minimal package.json + lockfile and the
# workspace libs it depends on into apps/$APP/dist.
RUN npx nx run @org/${APP}:prune

FROM node:${NODE_VERSION}-slim AS runtime
ARG APP
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /workspace/apps/${APP}/dist ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
USER node
CMD ["node", "main.js"]
