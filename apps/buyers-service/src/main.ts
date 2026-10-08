import { bootstrapMicroservice } from '@org/api-core';
import { BUYERS_SERVICE } from '@org/contracts';
import { AppModule } from './app/app.module';

bootstrapMicroservice(AppModule, BUYERS_SERVICE);
