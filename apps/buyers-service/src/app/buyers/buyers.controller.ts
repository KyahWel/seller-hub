import { Controller } from '@nestjs/common';
import { CrudMessageController } from '@org/api-core';
import type {
  CreateBuyerPayload,
  Buyer,
  UpdateBuyerPayload,
} from '@org/contracts';
import { BuyersPatterns } from '@org/contracts';
import { BuyersService } from './buyers.service';

/** Answers `BuyersPatterns` (findAll, findOne, create, update, remove). */
@Controller()
export class BuyersController extends CrudMessageController<
  Buyer,
  CreateBuyerPayload,
  UpdateBuyerPayload
>(BuyersPatterns) {
  constructor(service: BuyersService) {
    super(service);
  }
}
