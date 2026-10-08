import { Test } from '@nestjs/testing';
import { BuyersRepository } from './buyers.repository';
import { BuyersService } from './buyers.service';

describe('BuyersService', () => {
  let service: BuyersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BuyersService, BuyersRepository],
    }).compile();

    service = moduleRef.get(BuyersService);
  });

  it('creates and finds a buyer', async () => {
    const buyer = await service.create({
      sellerId: 's1',
      name: 'Juan Dela Cruz',
      phone: '09171234567',
    });

    await expect(service.findOne(buyer.id)).resolves.toEqual(buyer);
  });
});
