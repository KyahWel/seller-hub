import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController } from '@org/api-core';
import { Product, PRODUCTS_SERVICE, ProductsPatterns } from '@org/contracts';
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
  filterBy: ['sellerId', 'sku'],
}) {
  constructor(@Inject(PRODUCTS_SERVICE) client: ClientProxy) {
    super(client);
  }
}
