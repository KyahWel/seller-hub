import { bootstrapMicroservice } from '@org/api-core';
import { PRODUCTS_SERVICE } from '@org/contracts';
import { AppModule } from './app/app.module';

bootstrapMicroservice(AppModule, PRODUCTS_SERVICE);
