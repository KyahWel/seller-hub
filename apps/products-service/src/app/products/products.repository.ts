import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '@org/api-core';
import type { Product } from '@org/contracts';

/** In-memory for now. Replace the base class with a database-backed repository. */
@Injectable()
export class ProductsRepository extends InMemoryRepository<Product> {}
