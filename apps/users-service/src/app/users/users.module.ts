import { Module } from '@nestjs/common';
import { CredentialsRepository } from './credentials.repository';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, CredentialsRepository],
})
export class UsersModule {}
