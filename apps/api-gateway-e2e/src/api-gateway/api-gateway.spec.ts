import axios from 'axios';

const noThrow = { validateStatus: () => true };

describe('API gateway', () => {
  it('GET /api/health', async () => {
    const res = await axios.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ status: 'ok' });
  });

  it('runs a seller flow across the microservices', async () => {
    const { data: seller } = await axios.post('/api/users', {
      name: 'Ada Lovelace',
      email: `ada+${Date.now()}@example.com`,
    });
    expect(seller).toMatchObject({ name: 'Ada Lovelace' });

    const { data: product } = await axios.post('/api/products', {
      sellerId: seller.id,
      name: 'T-shirt',
      price: 25_000,
    });
    expect(product).toMatchObject({ stock: 0 });

    const { data: buyer } = await axios.post('/api/buyers', {
      sellerId: seller.id,
      name: 'Juan Dela Cruz',
      phone: '09171234567',
    });

    const { data: order } = await axios.post('/api/orders', {
      sellerId: seller.id,
      buyerId: buyer.id,
      channel: 'facebook',
      paymentMethod: 'cod',
      items: [
        {
          productId: product.id,
          name: 'T-shirt',
          quantity: 2,
          unitPrice: 25_000,
        },
      ],
      shippingFee: 8_000,
    });
    expect(order).toMatchObject({ status: 'pending', total: 58_000 });

    const { data: confirmed } = await axios.patch(`/api/orders/${order.id}`, {
      status: 'confirmed',
    });
    expect(confirmed).toMatchObject({ status: 'confirmed' });

    const { data: sellerOrders } = await axios.get(
      `/api/users/${seller.id}/orders`,
    );
    expect(sellerOrders).toMatchObject({ items: [confirmed], total: 1 });

    const { data: filtered } = await axios.get('/api/orders', {
      params: { sellerId: seller.id, status: 'confirmed' },
    });
    expect(filtered.items).toEqual([confirmed]);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await axios.post(
      '/api/users',
      { name: '', email: 'not-an-email' },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('maps a missing entity to 404', async () => {
    const res = await axios.get(
      '/api/products/6f1c1b8e-1f0e-4c1a-9a43-2a4e4a1c0b11',
      noThrow,
    );

    expect(res.status).toBe(404);
  });

  it('maps a duplicate email to 409', async () => {
    const user = { name: 'Dup', email: `dup+${Date.now()}@example.com` };
    await axios.post('/api/users', user);

    const res = await axios.post('/api/users', user, noThrow);

    expect(res.status).toBe(409);
  });

  it('maps an invalid status transition to 400', async () => {
    const { data: seller } = await axios.post('/api/users', {
      name: 'Grace',
      email: `grace+${Date.now()}@example.com`,
    });
    const { data: order } = await axios.post('/api/orders', {
      sellerId: seller.id,
      channel: 'tiktok',
      paymentMethod: 'gcash',
      items: [{ name: 'Cap', quantity: 1, unitPrice: 15_000 }],
    });

    const res = await axios.patch(
      `/api/orders/${order.id}`,
      { status: 'delivered' },
      noThrow,
    );

    expect(res.status).toBe(400);
  });
});

describe('security', () => {
  it('sends security headers and hides the framework', async () => {
    const res = await axios.get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects unknown fields instead of ignoring them', async () => {
    const res = await axios.post(
      '/api/users',
      { name: 'Eve', email: `eve+${Date.now()}@example.com`, isAdmin: true },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('rejects amounts that could overflow totals', async () => {
    const res = await axios.post(
      '/api/orders',
      {
        sellerId: '6f1c1b8e-1f0e-4c1a-9a43-2a4e4a1c0b11',
        channel: 'facebook',
        paymentMethod: 'cod',
        items: [
          { name: 'x', quantity: 10_000, unitPrice: Number.MAX_SAFE_INTEGER },
        ],
      },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('rejects oversized bodies', async () => {
    const res = await axios.post(
      '/api/users',
      { name: 'x'.repeat(200_000), email: 'big@example.com' },
      noThrow,
    );

    expect(res.status).toBe(413);
  });
});
