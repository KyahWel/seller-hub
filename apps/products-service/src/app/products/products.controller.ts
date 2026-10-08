import { Controller } from '@nestjs/common';
import { CrudMessageController } from '@org/api-core';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@org/contracts';
import { ProductsPatterns } from '@org/contracts';
import { ProductsService } from './products.service';

/** Answers `ProductsPatterns` (findAll, findOne, create, update, remove). */
@Controller()
export class ProductsController extends CrudMessageController<
  Product,
  CreateProductPayload,
  UpdateProductPayload
>(ProductsPatterns) {
  constructor(service: ProductsService) {
    super(service);
  }
}
