import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController } from '@org/api-core';
import { Product, PRODUCTS_SERVICE, ProductsPatterns } from '@org/contracts';
import { signedInSeller } from '../auth/session';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Controller('products')
export class ProductsController extends CrudHttpController<
  Product,
  CreateProductDto,
  UpdateProductDto
>({
  patterns: ProductsPatterns,
  createDto: CreateProductDto,
  updateDto: UpdateProductDto,
  filterBy: ['sku'],
  scope: (request) => ({ sellerId: signedInSeller(request) }),
}) {
  constructor(@Inject(PRODUCTS_SERVICE) client: ClientProxy) {
    super(client);
  }
}
