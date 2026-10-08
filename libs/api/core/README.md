# @org/api-core

Shared building blocks for the NestJS gateway and microservices.

| Export                                   | Used in  | Purpose                                                                          |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `Repository`, `InMemoryRepository`       | services | Storage port + in-memory implementation (swap for a DB-backed one later)         |
| `CrudService`                            | services | Paginated list, get, create, update, remove with override hooks                  |
| `CrudMessageController(patterns)`        | services | Base controller answering the `crudPatterns(...)` message patterns               |
| `bootstrapMicroservice(module, SERVICE)` | services | TCP microservice `main.ts` in one line                                           |
| `rpcError`, `notFound`, `badRequest`, …  | services | Errors that keep their status code across the TCP boundary                       |
| `CrudHttpController(options)`            | gateway  | Base REST controller: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| `serviceClient(SERVICE)`                 | gateway  | TCP client registration for `ClientsModule.registerAsync`                        |
| `RpcToHttpExceptionFilter`               | gateway  | Maps microservice errors back to HTTP statuses                                   |

## Adding a CRUD resource

1. **Contracts** (`@org/contracts`): entity extending `BaseEntity`, create/update payloads, and `XPatterns = { ...crudPatterns('x') }`.
2. **Service**: `XRepository extends InMemoryRepository<X>`, `XService extends CrudService<X, CreateX, UpdateX>`, `XController extends CrudMessageController(XPatterns)`.
3. **Gateway**: create/update DTOs implementing the payloads, and `XController extends CrudHttpController({ patterns, createDto, updateDto })`.

Custom behaviour goes in overrides (`toCreateData`, `toUpdateData`, or any method) and extra `@MessagePattern` / route handlers on the subclasses.

Run `npx nx test @org/api-core` to execute the unit tests.
