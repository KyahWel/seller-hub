import { Injectable } from '@nestjs/common';
import { conflict, CrudService } from '@org/api-core';
import type {
  CreateUserPayload,
  EntityData,
  UpdateUserPayload,
  User,
} from '@org/contracts';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService extends CrudService<
  User,
  CreateUserPayload,
  UpdateUserPayload
> {
  protected readonly entityName = 'User';

  constructor(repository: UsersRepository) {
    super(repository);
  }

  protected override async toCreateData(
    payload: CreateUserPayload,
  ): Promise<EntityData<User>> {
    await this.assertEmailAvailable(payload.email);
    return payload;
  }

  protected override async toUpdateData(
    changes: UpdateUserPayload,
    existing: User,
  ): Promise<Partial<EntityData<User>>> {
    if (changes.email && changes.email !== existing.email) {
      await this.assertEmailAvailable(changes.email);
    }
    return changes;
  }

  private async assertEmailAvailable(email: string) {
    const { total } = await this.repository.findMany({
      where: { email },
      take: 1,
    });
    if (total > 0) throw conflict(`Email ${email} is already registered`);
  }
}
