import { Test } from '@nestjs/testing';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ProductsService, ProductsRepository],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('defaults stock to zero', async () => {
    const product = await service.create({
      sellerId: 's1',
      name: 'T-shirt',
      price: 25_000,
    });

    expect(product).toMatchObject({ name: 'T-shirt', stock: 0 });
  });
});
