# CLAUDE.md

Nx monorepo (npm workspaces): Nuxt 4 app (`apps/web`), NestJS API gateway (`apps/api-gateway`), NestJS TCP microservices (`apps/*-service`), shared types in `libs/shared/contracts` (`@org/contracts`). See README.md for architecture and commands.

- Run tasks through Nx: `npx nx <target> <project>`, `npx nx run-many -t lint test build typecheck`, `npx nx affected -t …`. Project names are package names (`@org/web`, `@org/users-service`, …).
- Use generators (`npx nx g @nx/nest:app|lib`, `@nx/js:lib`) for new projects, then add `nx.tags` to the project's `package.json` and run `npx nx sync`.
- CRUD resources build on `@org/api-core` (`libs/api/core`): `CrudService` + `CrudMessageController` in services, `CrudHttpController` in the gateway. Put domain rules in `CrudService` hooks; throw `notFound`/`badRequest`/`conflict`, never plain errors. Money is integer centavos.
- Gateway → service calls go through `sendRpc` (timeout + 503/504 mapping), never a bare `firstValueFrom(client.send(...))`. Services bind to localhost by default; their TCP transport has no auth, so never expose service ports.
- Cross-service messages: define the pattern constant and payload types in `@org/contracts` first. Never use string literals.
- In Nest controllers, import interface types used in decorated signatures with `import type` (`isolatedModules` + `emitDecoratorMetadata`).
- `apps/web` is excluded from the `@nx/js/typescript` plugin. Its typecheck is `nuxt typecheck`, and its tsconfig comes from Nuxt's generated `.nuxt/tsconfig.*.json`.
- Unit tests: Jest (`*.spec.ts` next to sources) for Nest and libs; Vitest with `@nuxt/test-utils` (`mountSuspended`) for web.
