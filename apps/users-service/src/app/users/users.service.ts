import { Injectable } from '@nestjs/common';
import { conflict, CrudService } from '@org/api-core';
import type {
  CreateUserPayload,
  CredentialsPayload,
  EntityData,
  RegisterPayload,
  UpdateUserPayload,
  User,
} from '@org/contracts';
import { CredentialsRepository } from './credentials.repository';
import { DUMMY_HASH, hashPassword, verifyPassword } from './password';
import { UsersRepository } from './users.repository';

/** Emails are compared case-insensitively. */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

@Injectable()
export class UsersService extends CrudService<
  User,
  CreateUserPayload,
  UpdateUserPayload
> {
  protected readonly entityName = 'User';

  constructor(
    repository: UsersRepository,
    private readonly credentials: CredentialsRepository,
  ) {
    super(repository);
  }

  async register({ password, ...profile }: RegisterPayload): Promise<User> {
    const passwordHash = await hashPassword(password);
    const user = await this.create(profile);
    await this.credentials.create({ userId: user.id, passwordHash });
    return user;
  }

  /** Returns the user for a correct email/password pair, otherwise `null`. */
  async verifyCredentials({
    email,
    password,
  }: CredentialsPayload): Promise<User | null> {
    const user = await this.findByEmail(normalizeEmail(email));
    const credential = user
      ? (
          await this.credentials.findMany({
            where: { userId: user.id },
            take: 1,
          })
        ).items[0]
      : undefined;
    const valid = await verifyPassword(
      password,
      credential?.passwordHash ?? (await DUMMY_HASH),
    );
    return valid && user && credential ? user : null;
  }

  override async remove(id: string, scope?: Partial<User>): Promise<User> {
    const user = await super.remove(id, scope);
    const { items } = await this.credentials.findMany({
      where: { userId: id },
    });
    await Promise.all(items.map((c) => this.credentials.delete(c.id)));
    return user;
  }

  protected override async toCreateData({
    name,
    email,
  }: CreateUserPayload): Promise<EntityData<User>> {
    const normalized = normalizeEmail(email);
    await this.assertEmailAvailable(normalized);
    return { name: name.trim(), email: normalized };
  }

  protected override async toUpdateData(
    changes: UpdateUserPayload,
    existing: User,
  ): Promise<Partial<EntityData<User>>> {
    const email = changes.email && normalizeEmail(changes.email);
    if (email && email !== existing.email) {
      await this.assertEmailAvailable(email);
    }
    return { name: changes.name?.trim(), email };
  }

  private async findByEmail(email: string): Promise<User | null> {
    const { items } = await this.repository.findMany({
      where: { email },
      take: 1,
    });
    return items[0] ?? null;
  }

  private async assertEmailAvailable(email: string) {
    if (await this.findByEmail(email)) {
      throw conflict(`Email ${email} is already registered`);
    }
  }
}
