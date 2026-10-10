# Seller Hub

**One place for Filipino online sellers to track orders, products and buyers across Facebook, Instagram, TikTok, Shopee and Lazada.**

> [!WARNING]
> **Proof of concept — under active development, not in production.**
> Seller Hub is an early prototype for exploring the product and the architecture. It is not deployed anywhere, has no real users, and must not hold real customer data: everything is kept in memory and is lost when the services restart. Features, APIs and data models will change without notice. See the [roadmap](#roadmap) for what is still missing before a first release.

## What is Seller Hub?

Many small businesses in the Philippines sell through social media and marketplaces at the same time. Orders arrive as Messenger chats, Instagram DMs, TikTok comments and marketplace notifications, and they end up in notebooks, spreadsheets or nowhere. Most of these orders are paid by **cash on delivery (COD)**, so a seller only knows they were paid once the courier delivers. When a buyer refuses the parcel, the seller has paid for shipping both ways and has nothing to show for it (a _return to sender_, or RTS).

Seller Hub is a web dashboard where a seller records every order in one place, whatever channel it came from, and follows it until the money is in:

- **Orders** from any channel, with items, shipping fee, payment method (COD, GCash, Maya, bank transfer) and a status that moves from _pending_ → _confirmed_ → _shipped_ → _delivered_, or ends as _returned_ or _cancelled_.
- **Products** with price, cost, margin and stock, so new orders fill in names and prices and the seller sees what is running low.
- **Buyers** with their mobile number, address and notes, so repeat customers are one click away.
- **A dashboard** with open orders, delivered sales, COD still to collect, returns, recent orders and low-stock products.

### Who it is for

Solo sellers and small teams (resellers, home-based businesses, small brands) who sell on more than one channel and have outgrown chat threads and spreadsheets, but don't need a full e-commerce platform.

### Why it exists

The long-term goal is to cut the money sellers lose to bogus COD buyers and manual bookkeeping:

- **Buyer risk.** Every delivered or returned order is a data point. Showing a buyer's delivery history before shipping, and later a risk score, lets a seller ask for prepayment from buyers who often refuse parcels.
- **Less retyping.** Orders are agreed in chat, often in Taglish. An AI assistant that turns a pasted conversation into a draft order is planned.
- **Knowing where the money is.** Delivered sales, COD still out with couriers, and losses to returns, without a spreadsheet.

## What works today

| Area      | Status in the proof of concept                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Accounts  | Sign up, sign in, sign out. Each seller only sees their own products, buyers and orders                                           |
| Orders    | Create from saved products or custom items, link a buyer, add shipping and notes; move through statuses; filter by status; paging |
| Products  | Add, edit, delete; price, cost and margin; stock with "running low" and "sold out" badges                                         |
| Buyers    | Add, edit, delete; Philippine mobile number validation; search by name or number                                                  |
| Dashboard | Open orders, delivered sales, COD to collect, returns, recent orders, low stock                                                   |
| Interface | Responsive from phone to desktop, light and dark mode                                                                             |
| Data      | **In memory only**, lost on restart                                                                                               |

## Roadmap

Planned work is tracked as [GitHub issues](https://github.com/KyahWel/seller-hub/issues) in three [milestones](https://github.com/KyahWel/seller-hub/milestones):

1. **Finish login**: return to sign-in when a session expires (#6), account page and password change (#7).
2. **Foundation**: Postgres instead of memory (#8), revocable sessions (#9), email verification and password reset (#10), a stats endpoint (#11), end-to-end tests for sign-in and seller isolation (#12), a staging environment (#13), error tracking (#14), dependency upkeep (#15).
3. **Product**: buyer RTS history and risk score (#16), Data Privacy Act (RA 10173) compliance (#17), AI chat-to-order drafts (#18), PayMongo billing (#19).

Until the Foundation milestone is done, run Seller Hub only locally or in a private test environment with made-up data.

## How it is built

A TypeScript monorepo built with [Nx](https://nx.dev): a **Nuxt 4** web app using **Nuxt UI**, a **NestJS 11** API gateway, and NestJS **microservices**, one per area. All apps share types through a workspace library.

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

| Path                    | Project                 | Stack                                                                      | Tests                                        |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/web`              | `@org/web`              | Nuxt 4 + Nuxt UI seller dashboard (orders, products, buyers), `/api` proxy | Vitest + `@nuxt/test-utils`                  |
| `apps/web-e2e`          | `@org/web-e2e`          | Playwright against the production web build and a mock API                 | e2e                                          |
| `apps/api-gateway`      | `@org/api-gateway`      | NestJS HTTP, validation, TCP clients                                       | Jest (incl. HTTP tests with mocked services) |
| `apps/users-service`    | `@org/users-service`    | NestJS microservice (TCP)                                                  | Jest                                         |
| `apps/orders-service`   | `@org/orders-service`   | NestJS microservice (TCP)                                                  | Jest                                         |
| `apps/products-service` | `@org/products-service` | NestJS microservice (TCP)                                                  | Jest                                         |
| `apps/buyers-service`   | `@org/buyers-service`   | NestJS microservice (TCP)                                                  | Jest                                         |
| `libs/shared/contracts` | `@org/contracts`        | Message patterns, payload & entity types                                   | Jest                                         |
| `libs/api/core`         | `@org/api-core`         | Generic CRUD: repository, service, controllers, error mapping              | Jest                                         |

Tooling: TypeScript 6 (project references), ESLint 9 flat config with `@nx/enforce-module-boundaries`, Prettier, Husky + lint-staged, GitHub Actions CI, Docker and docker-compose.

## Getting started

Requires Node 24 (`nvm use`).

```sh
scripts/dev.sh         # web + gateway + all four microservices
```

`scripts/dev.sh` checks your Node version, runs `npm install` when the lockfile changed, creates `.env` from `.env.example` if missing, and stops early if a port it needs (4200, 3000–3004) is taken. `scripts/dev.sh api` starts only the gateway and services; `scripts/dev.sh web` starts only the web app. It wraps `npm run dev`, which you can also run directly after `npm install`.

- Web: http://localhost:4200. Create an account on `/register`; every page shows the signed-in seller's data. `useSession()` holds the signed-in seller and `useCrud('<resource>')` is the client for any gateway CRUD resource.
- API: http://localhost:3000/api
  - `GET /api/health` (public)
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` (public): set or clear the `session` cookie
  - `GET /api/users/me`, `PATCH /api/users/me`: the signed-in seller's account
  - CRUD on `/api/orders`, `/api/products`, `/api/buyers`: `GET /` (paginated, `?page=&limit=` plus filters such as `?status=`), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`. Every route needs a session and only sees the signed-in seller's records; `sellerId` is set by the gateway.

  Without `JWT_SECRET` the gateway signs sessions with a random secret, so restarting it signs everyone out.

Run only part of the stack with `npm run start:api` or `npm run start:web`, or start one project with `npx nx serve @org/users-service`.

## Common commands

| Command                        | What it does                                     |
| ------------------------------ | ------------------------------------------------ |
| `npm run dev`                  | Serve everything                                 |
| `npm run build`                | Build every project                              |
| `npm test`                     | Unit tests (Jest for Nest/libs, Vitest for Nuxt) |
| `npm run lint`                 | ESLint everywhere                                |
| `npm run typecheck`            | `tsc --build` / `nuxt typecheck`                 |
| `npm run e2e`                  | Playwright web e2e against a mock API            |
| `npm run affected`             | Lint/test/build/typecheck only what changed      |
| `npm run format`               | Prettier via `nx format`                         |
| `npm run graph`                | Interactive project graph                        |
| `npx nx show project @org/web` | List a project's targets                         |

Nx caches task results, so a second run of an unchanged task is instant.

### Check everything before you push

```sh
scripts/check.sh           # deps, format, lint, test, build, typecheck, e2e
scripts/check.sh --quick   # only projects changed vs main, no e2e
scripts/check.sh --fix     # format the code instead of only checking it
```

It runs the same checks as CI, plus dependency health: `npm ls` (installed tree matches `package.json`), `npm audit --omit=dev --audit-level=high` (fails on serious advisories in production dependencies), a count of advisories across all dependencies, and a table of outdated packages with major updates flagged. The last two are informational. It ends with a pass/fail summary and exits non-zero if a blocking check failed.

### Tests never call a real API

- **Unit tests** replace other services and the network with mocks (`ClientProxy` mocks in Nest, no `$fetch` in web component tests).
- **Gateway HTTP tests** (`apps/api-gateway/src/app/gateway.http.spec.ts`) boot the real gateway in-process (guards, CSRF check, validation, rate limits, error mapping) with every microservice replaced by a `mockClient()`. Each test sets what a service replies and checks what the gateway sent it.
- **Web e2e** (`apps/web-e2e`) runs Playwright against the production web build, with its `/api` proxy pointed at `apps/web-e2e/mock-api/server.mjs`, an in-memory stand-in for the gateway. No services or database are needed.

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
   - Give it a unique debug port in its `serve` target and add it to the `dev` / `start:api` scripts, `.env.example` and `docker-compose.yml`. In `gateway.http.spec.ts`, override its client with a `mockClient()`.

   See `libs/api/core/README.md` for the extension points.

3. Run `npx nx sync` to update TypeScript project references. Nx also offers this when you run a task.

## Conventions

- **Contracts first.** Message patterns (`UsersPatterns.Create`, …) and payload/entity types live in `@org/contracts` and are imported by both sides. Don't use string literals across service boundaries.
- **Validation at the edge.** The gateway validates HTTP input with `class-validator` DTOs that `implement` the contract payloads. Microservices trust their callers.
- **Type-only imports in decorated signatures.** With `isolatedModules` and `emitDecoratorMetadata`, interface types used in `@Payload()` parameters must be imported with `import type`.
- **Configuration through env.** See `.env.example`. Nest apps load `.env` from the working directory. Nuxt reads `NUXT_*` variables at runtime (`NUXT_API_BASE_URL`).
- **CRUD through `@org/api-core`.** Services extend `CrudService` and put domain rules in its hooks: unique email in `UsersService`, totals and status transitions in `OrdersService`. Throw `notFound` / `badRequest` / `conflict` from services; the gateway's `RpcToHttpExceptionFilter` turns them into the matching HTTP status.
- **Money is integer centavos** (₱1.00 = `100`).
- **Web UI is [Nuxt UI](https://ui.nuxt.com) v4** (Tailwind v4, Lucide icons, emerald on zinc, light and dark). Build pages from the shared pieces in `apps/web/app`:
  - `PagePanel` (navbar title, `#actions`, `#toolbar`) inside the `default` layout's sidebar; sign-in pages use the `auth` layout
  - `OrdersTable`, `StatCard`, `StatusBadge`, `EmptyState`, `MoneyInput`
  - forms are `UForm` with a Zod schema from `utils/schemas.ts` (field text in, gateway payload out, limits from `@org/contracts`) and `:validate-on="FORM_VALIDATE_ON"`
  - `useApiAction()` runs a request and reports it as a toast; `useConfirm()` asks in a modal
- **Data is in-memory.** Each service has an `XRepository extends InMemoryRepository<X>`. To add a database, implement `Repository<X>` and swap that class. The services stay unchanged.

## Security

What is in place, and what is not yet:

| Layer              | Measure                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gateway            | Session in an `httpOnly`, `SameSite=Lax` cookie holding a JWT (HS256, 7 days, `JWT_SECRET` required in production); every route needs it unless marked `@Public()`. Passwords hashed with scrypt; login and sign-up limited to 10 attempts per minute per IP |
| Gateway            | Products, buyers and orders are scoped to the signed-in seller; other sellers' records return 404                                                                                                                                                            |
| Gateway            | Cross-site writes refused unless their `Origin` is one of `CORS_ORIGIN` (CSRF)                                                                                                                                                                               |
| Gateway            | `helmet` security headers, `x-powered-by` removed                                                                                                                                                                                                            |
| Gateway            | Rate limit per client IP (`THROTTLE_LIMIT` per `THROTTLE_TTL_MS`, default 120/min), health check exempt                                                                                                                                                      |
| Gateway            | JSON bodies capped at `BODY_LIMIT` (100kb), unknown fields rejected (`forbidNonWhitelisted`), upper bounds on quantities, amounts and items per order                                                                                                        |
| Gateway → services | `sendRpc` times out after 5s (504) and reports unreachable services as 503; 5xx details from services are never sent to clients                                                                                                                              |
| Services           | Bind to `127.0.0.1` by default. The TCP transport has **no authentication**: in Docker they listen on the private network with no published ports. Never expose 3001–3004 publicly                                                                           |
| Web                | Clickjacking protection (`frame-ancestors 'none'`, `X-Frame-Options`), `nosniff`, referrer and permissions policies, HSTS in production builds                                                                                                               |
| Web → gateway      | The `/api` proxy overwrites `X-Forwarded-For` with the real client address, so the rate limit cannot be dodged by spoofing it (production builds; `nuxt dev` does not enforce this)                                                                          |
| Supply chain       | CI fails on high/critical advisories in production dependencies (`npm audit --omit=dev`); Dependabot opens weekly update PRs                                                                                                                                 |

**Not yet covered:** data is kept in memory (#8), and logout only clears the cookie, so a copied session token stays valid until it expires (#9). Also planned: encrypted service-to-service traffic (TLS or a service mesh) if services ever run on separate hosts, and a full Content Security Policy (script nonces via `nuxt-security`).

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
