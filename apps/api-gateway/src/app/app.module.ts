import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BuyersModule } from './buyers/buyers.module';
import { ClientsModule } from './clients/clients.module';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule,
    HealthModule,
    UsersModule,
    OrdersModule,
    ProductsModule,
    BuyersModule,
  ],
})
export class AppModule {}
