import { RpcException } from '@nestjs/microservices';
import type { BaseEntity, EntityData } from '@org/contracts';
import { InMemoryRepository } from '../persistence/in-memory.repository.js';
import { CrudService, MAX_PAGE_SIZE } from './crud.service.js';

interface Note extends BaseEntity {
  title: string;
  slug: string;
}

interface CreateNote {
  title: string;
}

class NotesService extends CrudService<Note, CreateNote> {
  protected readonly entityName = 'Note';

  constructor() {
    super(new InMemoryRepository<Note>());
  }

  protected override toCreateData({ title }: CreateNote): EntityData<Note> {
    return { title, slug: title.toLowerCase().replace(/\s+/g, '-') };
  }
}

describe('CrudService', () => {
  let service: NotesService;

  beforeEach(() => {
    service = new NotesService();
  });

  it('runs the create hook', async () => {
    const note = await service.create({ title: 'Hello World' });

    expect(note).toMatchObject({ title: 'Hello World', slug: 'hello-world' });
    await expect(service.findOne(note.id)).resolves.toEqual(note);
  });

  it('paginates and clamps the page size', async () => {
    await service.create({ title: 'a' });
    await service.create({ title: 'b' });

    await expect(service.findAll({ page: 2, limit: 1 })).resolves.toMatchObject(
      {
        items: [{ title: 'b' }],
        total: 2,
        page: 2,
        limit: 1,
      },
    );
    await expect(service.findAll({ limit: 10_000 })).resolves.toMatchObject({
      limit: MAX_PAGE_SIZE,
    });
  });

  it('updates and removes', async () => {
    const note = await service.create({ title: 'a' });

    await expect(
      service.update(note.id, { title: 'b' }),
    ).resolves.toMatchObject({
      title: 'b',
    });
    await expect(service.remove(note.id)).resolves.toMatchObject({
      id: note.id,
    });
  });

  it.each(['findOne', 'remove'] as const)(
    '%s throws a 404 RpcException for a missing id',
    async (method) => {
      const error = await service[method]('missing').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toEqual({
        statusCode: 404,
        message: 'Note missing not found',
      });
    },
  );
});
