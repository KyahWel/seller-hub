import { Module } from '@nestjs/common';
import { BuyersModule } from './buyers/buyers.module';

@Module({
  imports: [BuyersModule],
})
export class AppModule {}
