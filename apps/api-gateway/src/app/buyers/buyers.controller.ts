import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController } from '@org/api-core';
import { Buyer, BUYERS_SERVICE, BuyersPatterns } from '@org/contracts';
import { CreateBuyerDto, UpdateBuyerDto } from './buyer.dto';

@Controller('buyers')
export class BuyersController extends CrudHttpController<
  Buyer,
  CreateBuyerDto,
  UpdateBuyerDto
>({
  patterns: BuyersPatterns,
  createDto: CreateBuyerDto,
  updateDto: UpdateBuyerDto,
  filterBy: ['sellerId', 'phone'],
}) {
  constructor(@Inject(BUYERS_SERVICE) client: ClientProxy) {
    super(client);
  }
}
