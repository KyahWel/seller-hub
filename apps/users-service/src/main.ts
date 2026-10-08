import { bootstrapMicroservice } from '@org/api-core';
import { USERS_SERVICE } from '@org/contracts';
import { AppModule } from './app/app.module';

bootstrapMicroservice(AppModule, USERS_SERVICE);
