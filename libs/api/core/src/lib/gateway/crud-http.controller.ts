import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  type Type,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import type {
  BaseEntity,
  CrudPatterns,
  IdPayload,
  ListQuery,
  Paginated,
  UpdatePayload,
} from '@org/contracts';
import { ListQueryDto } from './list-query.dto.js';
import { sendRpc } from './send-rpc.js';

export interface CrudHttpControllerOptions<T extends BaseEntity> {
  patterns: CrudPatterns;
  /** class-validator DTO for `POST` bodies. */
  createDto: Type;
  /** class-validator DTO for `PATCH` bodies. */
  updateDto: Type;
  /** Query-string keys passed through as exact-match filters, e.g. `['sellerId']`. */
  filterBy?: readonly (keyof T & string)[];
}

export interface CrudHttpHandlers<T extends BaseEntity, C, U> {
  findAll(query: Record<string, unknown>): Promise<Paginated<T>>;
  findOne(id: string): Promise<T>;
  create(dto: C): Promise<T>;
  update(id: string, dto: U): Promise<T>;
  remove(id: string): Promise<T>;
}

const validate = (expectedType: Type) =>
  new ValidationPipe({
    expectedType,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

/**
 * Builds a gateway controller base class exposing REST CRUD routes that
 * forward to a microservice:
 * `GET /` (paginated), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`.
 *
 * ```ts
 * @Controller('products')
 * export class ProductsController extends CrudHttpController<Product, CreateProductDto, UpdateProductDto>({
 *   patterns: ProductsPatterns, createDto: CreateProductDto, updateDto: UpdateProductDto,
 * }) {
 *   constructor(@Inject(PRODUCTS_SERVICE) client: ClientProxy) { super(client); }
 * }
 * ```
 */
export function CrudHttpController<T extends BaseEntity, C, U>(
  options: CrudHttpControllerOptions<T>,
): abstract new (client: ClientProxy) => CrudHttpHandlers<T, C, U> {
  const { patterns, createDto, updateDto, filterBy = [] } = options;
  const listQuery = new ValidationPipe({
    expectedType: ListQueryDto,
    transform: true,
  });

  abstract class CrudHttpControllerBase implements CrudHttpHandlers<T, C, U> {
    constructor(private readonly client: ClientProxy) {}

    @Get()
    findAll(
      // Typed loosely so the global pipe leaves the filter keys alone.
      @Query(listQuery) query: Record<string, unknown>,
    ): Promise<Paginated<T>> {
      const { page, limit } = query as ListQueryDto;
      const where: Partial<T> = {};
      for (const key of filterBy) {
        if (typeof query[key] === 'string') {
          where[key] = query[key] as T[typeof key];
        }
      }
      return this.send<Paginated<T>, ListQuery<T>>(patterns.FindAll, {
        page,
        limit,
        where,
      });
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
      return this.send<T, IdPayload>(patterns.FindOne, { id });
    }

    @Post()
    create(@Body(validate(createDto)) dto: C): Promise<T> {
      return this.send<T, C>(patterns.Create, dto);
    }

    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body(validate(updateDto)) dto: U,
    ): Promise<T> {
      return this.send<T, UpdatePayload<U>>(patterns.Update, {
        id,
        changes: dto,
      });
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
      return this.send<T, IdPayload>(patterns.Remove, { id });
    }

    private send<R, P>(pattern: string, payload: P): Promise<R> {
      return sendRpc<R, P>(this.client, pattern, payload);
    }
  }
  return CrudHttpControllerBase;
}
