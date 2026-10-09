# Seller Hub

Order, product and buyer management for Filipino online sellers (Facebook, Instagram, TikTok, Shopee, Lazada).

A TypeScript monorepo built with [Nx](https://nx.dev). It has a **Nuxt 4** frontend, a **NestJS 11** API gateway and NestJS **microservices**. All apps share types through a workspace library.

```
                ┌────────────┐  HTTP   ┌──────────────┐  TCP   ┌──────────────────┐
 browser ─────▶ │  web       │ ──────▶ │ api-gateway  │ ─────▶ │ users-service    │ :3001
                │  (Nuxt)    │ /api/** │ (NestJS)     │        │ orders-service   │ :3002
                │  :4200     │  proxy  │ :3000/api    │        │ products-service │ :3003
                └────────────┘         └──────────────┘        │ buyers-service   │ :3004
                                                               └──────────────────┘
       types: libs/shared/contracts (@org/contracts)
       CRUD building blocks: libs/api/core (@org/api-core)
```

**API style.** REST at the edge (browser → gateway) and NestJS TCP between the gateway and services. Every service is TypeScript and shares `@org/contracts`, so TCP gives end-to-end types without `.proto` files or codegen. Nest abstracts the transport, so switching a service to gRPC, or adding NATS/Redis for events, is a config change.

## What's inside

| Path                    | Project                 | Stack                                                            | Tests                       |
| ----------------------- | ----------------------- | ---------------------------------------------------------------- | --------------------------- |
| `apps/web`              | `@org/web`              | Nuxt 4 seller dashboard (orders, products, buyers), `/api` proxy | Vitest + `@nuxt/test-utils` |
| `apps/web-e2e`          | `@org/web-e2e`          | Playwright                                                       | e2e                         |
| `apps/api-gateway`      | `@org/api-gateway`      | NestJS HTTP, validation, TCP clients                             | Jest                        |
| `apps/api-gateway-e2e`  | `@org/api-gateway-e2e`  | Jest + axios against the running stack                           | e2e                         |
| `apps/users-service`    | `@org/users-service`    | NestJS microservice (TCP)                                        | Jest                        |
| `apps/orders-service`   | `@org/orders-service`   | NestJS microservice (TCP)                                        | Jest                        |
| `apps/products-service` | `@org/products-service` | NestJS microservice (TCP)                                        | Jest                        |
| `apps/buyers-service`   | `@org/buyers-service`   | NestJS microservice (TCP)                                        | Jest                        |
| `libs/shared/contracts` | `@org/contracts`        | Message patterns, payload & entity types                         | Jest                        |
| `libs/api/core`         | `@org/api-core`         | Generic CRUD: repository, service, controllers, error mapping    | Jest                        |

Tooling: TypeScript 6 (project references), ESLint 9 flat config with `@nx/enforce-module-boundaries`, Prettier, Husky + lint-staged, GitHub Actions CI, Docker and docker-compose.

## Getting started

Requires Node 24 (`nvm use`).

```sh
npm install
cp .env.example .env   # optional, the defaults work locally
npm run dev            # web + gateway + both microservices
```

- Web: http://localhost:4200. Add a seller on `/sellers` first; the other pages work on the active seller (stored in a cookie until login exists). `useCrud('<resource>')` is the client for any gateway CRUD resource.
- API: http://localhost:3000/api
  - `GET /api/health`
  - CRUD on `/api/users`, `/api/orders`, `/api/products`, `/api/buyers`: `GET /` (paginated, `?page=&limit=` plus filters such as `?sellerId=`), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
  - `GET /api/users/:id/orders`: a seller's orders

Run only part of the stack with `npm run start:api` or `npm run start:web`, or start one project with `npx nx serve @org/users-service`.

## Common commands

| Command                        | What it does                                        |
| ------------------------------ | --------------------------------------------------- |
| `npm run dev`                  | Serve everything                                    |
| `npm run build`                | Build every project                                 |
| `npm test`                     | Unit tests (Jest for Nest/libs, Vitest for Nuxt)    |
| `npm run lint`                 | ESLint everywhere                                   |
| `npm run typecheck`            | `tsc --build` / `nuxt typecheck`                    |
| `npm run e2e`                  | API e2e (boots all services) and Playwright web e2e |
| `npm run affected`             | Lint/test/build/typecheck only what changed         |
| `npm run format`               | Prettier via `nx format`                            |
| `npm run graph`                | Interactive project graph                           |
| `npx nx show project @org/web` | List a project's targets                            |

Nx caches task results, so a second run of an unchanged task is instant.

## Adding things

```sh
# Another NestJS microservice
npx nx g @nx/nest:app apps/payments-service --linter=eslint --unitTestRunner=jest --e2eTestRunner=none

# A shared library
npx nx g @nx/js:lib libs/shared/utils --bundler=tsc --linter=eslint --unitTestRunner=jest

# A NestJS library (modules, guards, interceptors…)
npx nx g @nx/nest:lib libs/api/auth --linter=eslint --unitTestRunner=jest
```

After generating:

1. Add `nx.tags` to the new project's `package.json`, e.g. `["type:app", "scope:api"]`. The tags drive the module-boundary rules in `eslint.config.mjs`.
2. To wire up a new microservice, follow `products-service`:
   - Add its token and default port to `transport.ts`, plus its entity, payloads and `XPatterns = { ...crudPatterns('x') }` in `@org/contracts`.
   - `main.ts` is `bootstrapMicroservice(AppModule, X_SERVICE)`.
   - Add a repository (`extends InMemoryRepository<X>`), a service (`extends CrudService`) and a controller (`extends CrudMessageController(XPatterns)`).
   - In the gateway, add `serviceClient(X_SERVICE)` to `clients.module.ts`, plus DTOs and a controller extending `CrudHttpController({ patterns, createDto, updateDto })`.
   - Give it a unique debug port in its `serve` target and add it to the `dev` / `start:api` scripts, the e2e `dependsOn` list, `.env.example` and `docker-compose.yml`.

   See `libs/api/core/README.md` for the extension points.

3. Run `npx nx sync` to update TypeScript project references. Nx also offers this when you run a task.

## Conventions

- **Contracts first.** Message patterns (`UsersPatterns.Create`, …) and payload/entity types live in `@org/contracts` and are imported by both sides. Don't use string literals across service boundaries.
- **Validation at the edge.** The gateway validates HTTP input with `class-validator` DTOs that `implement` the contract payloads. Microservices trust their callers.
- **Type-only imports in decorated signatures.** With `isolatedModules` and `emitDecoratorMetadata`, interface types used in `@Payload()` parameters must be imported with `import type`.
- **Configuration through env.** See `.env.example`. Nest apps load `.env` from the working directory. Nuxt reads `NUXT_*` variables at runtime (`NUXT_API_BASE_URL`).
- **CRUD through `@org/api-core`.** Services extend `CrudService` and put domain rules in its hooks: unique email in `UsersService`, totals and status transitions in `OrdersService`. Throw `notFound` / `badRequest` / `conflict` from services; the gateway's `RpcToHttpExceptionFilter` turns them into the matching HTTP status.
- **Money is integer centavos** (₱1.00 = `100`).
- **Data is in-memory.** Each service has an `XRepository extends InMemoryRepository<X>`. To add a database, implement `Repository<X>` and swap that class. The services stay unchanged.

## Security

What is in place, and what is not yet:

| Layer              | Measure                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gateway            | `helmet` security headers, `x-powered-by` removed                                                                                                                                   |
| Gateway            | Rate limit per client IP (`THROTTLE_LIMIT` per `THROTTLE_TTL_MS`, default 120/min), health check exempt                                                                             |
| Gateway            | JSON bodies capped at `BODY_LIMIT` (100kb), unknown fields rejected (`forbidNonWhitelisted`), upper bounds on quantities, amounts and items per order                               |
| Gateway → services | `sendRpc` times out after 5s (504) and reports unreachable services as 503; 5xx details from services are never sent to clients                                                     |
| Services           | Bind to `127.0.0.1` by default. The TCP transport has **no authentication**: in Docker they listen on the private network with no published ports. Never expose 3001–3004 publicly  |
| Web                | Clickjacking protection (`frame-ancestors 'none'`, `X-Frame-Options`), `nosniff`, referrer and permissions policies, HSTS in production builds                                      |
| Web → gateway      | The `/api` proxy overwrites `X-Forwarded-For` with the real client address, so the rate limit cannot be dodged by spoofing it (production builds; `nuxt dev` does not enforce this) |
| Supply chain       | CI fails on high/critical advisories in production dependencies (`npm audit --omit=dev`); Dependabot opens weekly update PRs                                                        |

**Not yet covered:** authentication and per-seller authorization. Until login exists, anyone who can reach the app can read and change every seller's data, so do not deploy it publicly with real data. Also planned: encrypted service-to-service traffic (TLS or a service mesh) if services ever run on separate hosts, and a full Content Security Policy (script nonces via `nuxt-security`).

## Docker

```sh
docker compose up --build
```

`docker/nest.Dockerfile` builds any Nest app (`--build-arg APP=users-service`). It runs `nx run @org/<app>:prune`, which outputs the bundle plus a pruned `package.json`/lockfile and the workspace libs it uses. `docker/nuxt.Dockerfile` ships Nitro's self-contained `.output`.

## Renaming the `@org` scope

The scope is a placeholder. Replace `@org/` across the repo (package names, imports, `customConditions` in `tsconfig.base.json` and `apps/web/nuxt.config.ts`), then run `rm -rf node_modules package-lock.json && npm install`.

## Git hooks & CI

- `pre-commit` runs lint-staged: ESLint `--fix` and Prettier on staged files.
- `.github/workflows/ci.yml` runs format check, affected lint/test/build/typecheck, and affected e2e on every PR and push to `main`.
