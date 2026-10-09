import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CrudMessageController } from '@org/api-core';
import type {
  CreateUserPayload,
  CredentialsPayload,
  RegisterPayload,
  UpdateUserPayload,
  User,
} from '@org/contracts';
import { UsersPatterns } from '@org/contracts';
import { UsersService } from './users.service';

/** Answers `UsersPatterns`: the CRUD patterns plus register and login checks. */
@Controller()
export class UsersController extends CrudMessageController<
  User,
  CreateUserPayload,
  UpdateUserPayload
>(UsersPatterns) {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @MessagePattern(UsersPatterns.Register)
  register(@Payload() payload: RegisterPayload): Promise<User> {
    return this.usersService.register(payload);
  }

  @MessagePattern(UsersPatterns.VerifyCredentials)
  verifyCredentials(
    @Payload() payload: CredentialsPayload,
  ): Promise<User | null> {
    return this.usersService.verifyCredentials(payload);
  }
}
