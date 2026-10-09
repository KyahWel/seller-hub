import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
  BaseEntity,
  CrudPatterns,
  IdPayload,
  ListQuery,
  Paginated,
  UpdatePayload,
} from '@org/contracts';
import type { CrudService } from './crud.service.js';

export interface CrudMessageHandlers<T extends BaseEntity, C, U> {
  findAll(query?: ListQuery<T>): Promise<Paginated<T>>;
  findOne(payload: IdPayload<T>): Promise<T>;
  create(payload: C): Promise<T>;
  update(payload: UpdatePayload<U, T>): Promise<T>;
  remove(payload: IdPayload<T>): Promise<T>;
}

/**
 * Builds a microservice controller base class that answers the standard CRUD
 * patterns by delegating to a `CrudService`.
 *
 * ```ts
 * @Controller()
 * export class ProductsController extends CrudMessageController(ProductsPatterns) {
 *   constructor(service: ProductsService) { super(service); }
 * }
 * ```
 * Add custom `@MessagePattern` handlers to the subclass as usual.
 */
export function CrudMessageController<T extends BaseEntity, C, U>(
  patterns: CrudPatterns,
): abstract new (
  service: CrudService<T, C, U>,
) => CrudMessageHandlers<T, C, U> {
  abstract class CrudMessageControllerBase implements CrudMessageHandlers<
    T,
    C,
    U
  > {
    constructor(private readonly service: CrudService<T, C, U>) {}

    @MessagePattern(patterns.FindAll)
    findAll(@Payload() query: ListQuery<T> = {}): Promise<Paginated<T>> {
      return this.service.findAll(query);
    }

    @MessagePattern(patterns.FindOne)
    findOne(@Payload() { id, scope }: IdPayload<T>): Promise<T> {
      return this.service.findOne(id, scope);
    }

    @MessagePattern(patterns.Create)
    create(@Payload() payload: C): Promise<T> {
      return this.service.create(payload);
    }

    @MessagePattern(patterns.Update)
    update(@Payload() { id, changes, scope }: UpdatePayload<U, T>): Promise<T> {
      return this.service.update(id, changes, scope);
    }

    @MessagePattern(patterns.Remove)
    remove(@Payload() { id, scope }: IdPayload<T>): Promise<T> {
      return this.service.remove(id, scope);
    }
  }
  return CrudMessageControllerBase;
}
