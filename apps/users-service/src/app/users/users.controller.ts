import { Controller } from '@nestjs/common';
import { CrudMessageController } from '@org/api-core';
import type {
  CreateUserPayload,
  User,
  UpdateUserPayload,
} from '@org/contracts';
import { UsersPatterns } from '@org/contracts';
import { UsersService } from './users.service';

/** Answers `UsersPatterns` (findAll, findOne, create, update, remove). */
@Controller()
export class UsersController extends CrudMessageController<
  User,
  CreateUserPayload,
  UpdateUserPayload
>(UsersPatterns) {
  constructor(service: UsersService) {
    super(service);
  }
}
