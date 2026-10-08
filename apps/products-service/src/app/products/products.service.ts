import { Injectable } from '@nestjs/common';
import { CrudService } from '@org/api-core';
import type {
  CreateProductPayload,
  EntityData,
  Product,
  UpdateProductPayload,
} from '@org/contracts';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService extends CrudService<
  Product,
  CreateProductPayload,
  UpdateProductPayload
> {
  protected readonly entityName = 'Product';

  constructor(repository: ProductsRepository) {
    super(repository);
  }

  protected override toCreateData({
    stock = 0,
    ...payload
  }: CreateProductPayload): EntityData<Product> {
    return { ...payload, stock };
  }
}
