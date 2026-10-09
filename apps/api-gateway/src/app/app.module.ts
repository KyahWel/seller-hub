import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { BuyersModule } from './buyers/buyers.module';
import { ClientsModule } from './clients/clients.module';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Per-client-IP rate limit for every route (opt out with @SkipThrottle()).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL_MS', 60_000)),
          limit: Number(config.get('THROTTLE_LIMIT', 120)),
        },
      ],
    }),
    ClientsModule,
    AuthModule,
    HealthModule,
    UsersModule,
    OrdersModule,
    ProductsModule,
    BuyersModule,
  ],
  providers: [
    // Global guards run in this order: rate limit first, then sign-in check.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
