import { bootstrapMicroservice } from '@org/api-core';
import { ORDERS_SERVICE } from '@org/contracts';
import { AppModule } from './app/app.module';

bootstrapMicroservice(AppModule, ORDERS_SERVICE);
