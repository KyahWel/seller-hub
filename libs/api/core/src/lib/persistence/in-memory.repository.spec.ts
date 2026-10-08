import type { BaseEntity } from '@org/contracts';
import { InMemoryRepository } from './in-memory.repository.js';

interface Thing extends BaseEntity {
  ownerId: string;
  name: string;
}

describe('InMemoryRepository', () => {
  let repo: InMemoryRepository<Thing>;

  beforeEach(() => {
    repo = new InMemoryRepository<Thing>();
  });

  it('creates records with id and timestamps', async () => {
    const thing = await repo.create({ ownerId: 'a', name: 'Lamp' });

    expect(thing).toMatchObject({ ownerId: 'a', name: 'Lamp' });
    expect(thing.id).toEqual(expect.any(String));
    expect(thing.createdAt).toBe(thing.updatedAt);
    await expect(repo.findById(thing.id)).resolves.toEqual(thing);
  });

  it('filters and paginates', async () => {
    await repo.create({ ownerId: 'a', name: '1' });
    await repo.create({ ownerId: 'b', name: '2' });
    await repo.create({ ownerId: 'a', name: '3' });

    const page = await repo.findMany({
      where: { ownerId: 'a' },
      skip: 1,
      take: 1,
    });

    expect(page.total).toBe(2);
    expect(page.items.map((t) => t.name)).toEqual(['3']);
  });

  it('updates without overwriting fields with undefined', async () => {
    const thing = await repo.create({ ownerId: 'a', name: 'Lamp' });

    const updated = await repo.update(thing.id, {
      name: undefined,
      ownerId: 'b',
    });

    expect(updated).toMatchObject({ name: 'Lamp', ownerId: 'b' });
  });

  it('returns null when updating or deleting a missing id', async () => {
    await expect(repo.update('missing', { name: 'x' })).resolves.toBeNull();
    await expect(repo.delete('missing')).resolves.toBeNull();
  });

  it('deletes and returns the record', async () => {
    const thing = await repo.create({ ownerId: 'a', name: 'Lamp' });

    await expect(repo.delete(thing.id)).resolves.toEqual(thing);
    await expect(repo.findById(thing.id)).resolves.toBeNull();
  });
});
