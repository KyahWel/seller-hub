import { Module } from '@nestjs/common';
import { BuyersController } from './buyers.controller';

@Module({
  controllers: [BuyersController],
})
export class BuyersModule {}
