import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const noThrow = { validateStatus: () => true };
const PASSWORD = 'correct horse battery';
const MISSING_ID = '6f1c1b8e-1f0e-4c1a-9a43-2a4e4a1c0b11';

/** A unique email per call, so reruns against the same services don't clash. */
function uniqueEmail(name: string): string {
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  return `${name.toLowerCase()}+${suffix}@example.com`;
}

/** `session=…` from a login/register response, ready for a `Cookie` header. */
function sessionCookie(res: AxiosResponse): string {
  const cookie = res.headers['set-cookie']?.find((c) =>
    c.startsWith('session='),
  );
  if (!cookie) throw new Error('No session cookie in the response');
  return cookie.split(';')[0] ?? '';
}

/** Registers a seller and returns a client that sends their session cookie. */
async function signUp(name: string) {
  const email = uniqueEmail(name);
  const res = await axios.post('/api/auth/register', {
    name,
    email,
    password: PASSWORD,
  });
  const api: AxiosInstance = axios.create({
    headers: { Cookie: sessionCookie(res) },
  });
  return { seller: res.data, email, api };
}

type Seller = Awaited<ReturnType<typeof signUp>>;

// Sign-up is limited to 10 attempts per minute per IP, so tests share two
// sellers instead of registering their own.
let ada: Seller;
let bob: Seller;

beforeAll(async () => {
  ada = await signUp('Ada');
  bob = await signUp('Bob');
});

describe('API gateway', () => {
  it('GET /api/health is public', async () => {
    const res = await axios.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ status: 'ok' });
  });

  it('runs a seller flow across the microservices', async () => {
    const { seller, api } = ada;
    expect(seller).toMatchObject({ name: 'Ada' });
    expect(seller).not.toHaveProperty('password');

    const { data: me } = await api.get('/api/users/me');
    expect(me).toEqual(seller);

    const { data: product } = await api.post('/api/products', {
      name: 'T-shirt',
      price: 25_000,
    });
    expect(product).toMatchObject({ sellerId: seller.id, stock: 0 });

    const { data: buyer } = await api.post('/api/buyers', {
      name: 'Juan Dela Cruz',
      phone: '09171234567',
    });

    const { data: order } = await api.post('/api/orders', {
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
    expect(order).toMatchObject({
      sellerId: seller.id,
      status: 'pending',
      total: 58_000,
    });

    const { data: confirmed } = await api.patch(`/api/orders/${order.id}`, {
      status: 'confirmed',
    });
    expect(confirmed).toMatchObject({ status: 'confirmed' });

    const { data: filtered } = await api.get('/api/orders', {
      params: { status: 'confirmed' },
    });
    expect(filtered.items).toContainEqual(confirmed);
    expect(
      filtered.items.every((o: { status: string }) => o.status === 'confirmed'),
    ).toBe(true);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await axios.post(
      '/api/auth/register',
      { name: '', email: 'not-an-email', password: PASSWORD },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('maps a missing entity to 404', async () => {
    const res = await ada.api.get(`/api/products/${MISSING_ID}`, noThrow);

    expect(res.status).toBe(404);
  });

  it('maps a duplicate email to 409', async () => {
    const res = await axios.post(
      '/api/auth/register',
      { name: 'Ada again', email: ada.email, password: PASSWORD },
      noThrow,
    );

    expect(res.status).toBe(409);
  });

  it('maps an invalid status transition to 400', async () => {
    const { data: order } = await ada.api.post('/api/orders', {
      channel: 'tiktok',
      paymentMethod: 'gcash',
      items: [{ name: 'Cap', quantity: 1, unitPrice: 15_000 }],
    });

    const res = await ada.api.patch(
      `/api/orders/${order.id}`,
      { status: 'delivered' },
      noThrow,
    );

    expect(res.status).toBe(400);
  });
});

describe('authentication', () => {
  it('requires a session on every non-public route', async () => {
    for (const path of ['/api/users/me', '/api/products', '/api/orders']) {
      const res = await axios.get(path, noThrow);
      expect(res.status).toBe(401);
    }
  });

  it('signs in with the right password only, without revealing which part was wrong', async () => {
    const { email } = ada;

    const ok = await axios.post('/api/auth/login', {
      email,
      password: PASSWORD,
    });
    expect(ok.status).toBe(200);
    expect(sessionCookie(ok)).toMatch(/^session=.+/);

    const wrongPassword = await axios.post(
      '/api/auth/login',
      { email, password: 'wrong password' },
      noThrow,
    );
    const unknownEmail = await axios.post(
      '/api/auth/login',
      { email: uniqueEmail('nobody'), password: PASSWORD },
      noThrow,
    );
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.data.message).toBe(unknownEmail.data.message);
  });

  it('sets an httpOnly session cookie and clears it on logout', async () => {
    const res = await axios.post('/api/auth/register', {
      name: 'Cookie',
      email: uniqueEmail('cookie'),
      password: PASSWORD,
    });
    const setCookie = res.headers['set-cookie']?.join('\n') ?? '';
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);

    const logout = await axios.post('/api/auth/logout', null, {
      headers: { Cookie: sessionCookie(res) },
    });
    expect(logout.status).toBe(204);
    expect(logout.headers['set-cookie']?.join('\n')).toMatch(
      /session=;.*Expires=Thu, 01 Jan 1970/i,
    );
  });

  it('rejects a forged token', async () => {
    const res = await axios.get('/api/users/me', {
      ...noThrow,
      headers: { Authorization: 'Bearer abc.def.ghi' },
    });

    expect(res.status).toBe(401);
  });
});

describe('seller isolation', () => {
  it("hides one seller's records from another", async () => {
    const { data: product } = await ada.api.post('/api/products', {
      name: 'Tote',
      price: 24_900,
    });

    const { data: bobsList } = await bob.api.get('/api/products');
    expect(bobsList.items).not.toContainEqual(product);

    for (const res of [
      await bob.api.get(`/api/products/${product.id}`, noThrow),
      await bob.api.patch(`/api/products/${product.id}`, { price: 1 }, noThrow),
      await bob.api.delete(`/api/products/${product.id}`, noThrow),
    ]) {
      expect(res.status).toBe(404);
    }

    const { data: stillThere } = await ada.api.get(
      `/api/products/${product.id}`,
    );
    expect(stillThere).toEqual(product);
  });

  it('sets sellerId from the session and refuses it in the body', async () => {
    const { seller, api } = bob;

    const res = await api.post(
      '/api/products',
      { name: 'Cap', price: 15_000, sellerId: MISSING_ID },
      noThrow,
    );
    expect(res.status).toBe(400);

    const { data: product } = await api.post('/api/products', {
      name: 'Cap',
      price: 15_000,
    });
    expect(product.sellerId).toBe(seller.id);
  });
});

describe('security', () => {
  it('sends security headers and hides the framework', async () => {
    const res = await axios.get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects unknown fields instead of ignoring them', async () => {
    const res = await bob.api.post(
      '/api/products',
      { name: 'Hat', price: 10_000, isAdmin: true },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('rejects amounts that could overflow totals', async () => {
    const res = await bob.api.post(
      '/api/orders',
      {
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

  it('refuses cross-site writes (CSRF)', async () => {
    const res = await ada.api.post(
      '/api/products',
      { name: 'Evil', price: 1 },
      { ...noThrow, headers: { Origin: 'https://evil.example' } },
    );

    expect(res.status).toBe(403);
  });

  it('rejects oversized bodies', async () => {
    const res = await axios.post(
      '/api/auth/register',
      {
        name: 'x'.repeat(200_000),
        email: 'big@example.com',
        password: PASSWORD,
      },
      noThrow,
    );

    expect(res.status).toBe(413);
  });
});
