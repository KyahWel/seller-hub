import { Injectable } from '@nestjs/common';
import { CrudService } from '@org/api-core';
import type {
  Buyer,
  CreateBuyerPayload,
  UpdateBuyerPayload,
} from '@org/contracts';
import { BuyersRepository } from './buyers.repository';

@Injectable()
export class BuyersService extends CrudService<
  Buyer,
  CreateBuyerPayload,
  UpdateBuyerPayload
> {
  protected readonly entityName = 'Buyer';

  constructor(repository: BuyersRepository) {
    super(repository);
  }
}
