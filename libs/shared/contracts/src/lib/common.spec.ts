import { crudPatterns } from './common.js';

describe('crudPatterns', () => {
  it('prefixes every CRUD pattern with the resource name', () => {
    expect(crudPatterns('products')).toEqual({
      FindAll: 'products.findAll',
      FindOne: 'products.findOne',
      Create: 'products.create',
      Update: 'products.update',
      Remove: 'products.remove',
    });
  });
});
