/**
 * The whole gateway over real HTTP (guards, CSRF check, validation, rate
 * limits, error mapping) with every microservice replaced by a mock client.
 * No services or network beyond localhost: each test sets what the services
 * reply and checks what the gateway sent them.
 */
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import {
  BUYERS_SERVICE,
  ORDERS_SERVICE,
  OrdersPatterns,
  PRODUCTS_SERVICE,
  ProductsPatterns,
  type User,
  USERS_SERVICE,
  UsersPatterns,
} from '@org/contracts';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { randomUUID } from 'node:crypto';
import { defer, throwError } from 'rxjs';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

type Reply = (payload: any) => unknown;

/**
 * A stand-in for a microservice's `ClientProxy`. `reply(pattern, fn)` sets
 * the answer to a message; `fn` may throw `serviceError(...)`. Messages
 * without a reply fail the request, so unexpected calls show up as errors.
 */
function mockClient() {
  const replies = new Map<string, Reply>();
  return {
    send: jest.fn((pattern: string, payload: unknown) => {
      const reply = replies.get(pattern);
      if (!reply) {
        return throwError(() => new Error(`Unexpected message ${pattern}`));
      }
      return defer(async () => reply(payload));
    }),
    emit: jest.fn(),
    connect: jest.fn(async () => undefined),
    close: jest.fn(async () => undefined),
    reply(pattern: string, fn: Reply) {
      replies.set(pattern, fn);
    },
    reset() {
      replies.clear();
      this.send.mockClear();
    },
  };
}
type MockClient = ReturnType<typeof mockClient>;

/** What a service sends back over TCP when it throws `rpcError`. */
const serviceError = (statusCode: number, message: string) => ({
  statusCode,
  message,
});

/** Payloads the gateway sent for `pattern`. */
const sent = (client: MockClient, pattern: string) =>
  client.send.mock.calls
    .filter(([p]) => p === pattern)
    .map(([, payload]) => payload);

const PASSWORD = 'correct horse battery';
const MISSING_ID = '6f1c1b8e-1f0e-4c1a-9a43-2a4e4a1c0b11';
const noThrow = { validateStatus: () => true };

let app: INestApplication;
let http: AxiosInstance;
const users = mockClient();
const products = mockClient();
const orders = mockClient();
const buyers = mockClient();

/** Accounts the users-service mock knows, by email. */
const accounts = new Map<string, { user: User; password: string }>();

function mockUsersService() {
  users.reply(UsersPatterns.Register, ({ name, email, password }) => {
    if (accounts.has(email)) {
      throw serviceError(409, `Email ${email} is already registered`);
    }
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      name,
      email,
      createdAt: now,
      updatedAt: now,
    };
    accounts.set(email, { user, password });
    return user;
  });
  users.reply(UsersPatterns.VerifyCredentials, ({ email, password }) => {
    const account = accounts.get(email);
    return account && account.password === password ? account.user : null;
  });
  users.reply(UsersPatterns.FindOne, ({ id }) => {
    const account = [...accounts.values()].find((a) => a.user.id === id);
    if (!account) throw serviceError(404, `User ${id} not found`);
    return account.user;
  });
}

/** `session=…` from a login/register response, ready for a `Cookie` header. */
function sessionCookie(res: AxiosResponse): string {
  const cookie = res.headers['set-cookie']?.find((c) =>
    c.startsWith('session='),
  );
  if (!cookie) throw new Error('No session cookie in the response');
  return cookie.split(';')[0] ?? '';
}

let emailCount = 0;
const uniqueEmail = (name: string) =>
  `${name.toLowerCase()}+${++emailCount}@example.com`;

/** Registers a seller and returns a client that sends their session cookie. */
async function signUp(name: string) {
  const email = uniqueEmail(name);
  const res = await http.post('/api/auth/register', {
    name,
    email,
    password: PASSWORD,
  });
  const api = axios.create({
    baseURL: http.defaults.baseURL,
    headers: { Cookie: sessionCookie(res) },
  });
  return { seller: res.data as User, email, api };
}

type Seller = Awaited<ReturnType<typeof signUp>>;
// Sign-up is limited to 10 attempts per minute per IP, so tests share two
// sellers instead of registering their own.
let ada: Seller;
let bob: Seller;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(USERS_SERVICE)
    .useValue(users)
    .overrideProvider(PRODUCTS_SERVICE)
    .useValue(products)
    .overrideProvider(ORDERS_SERVICE)
    .useValue(orders)
    .overrideProvider(BUYERS_SERVICE)
    .useValue(buyers)
    .compile();
  const nestApp = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    logger: false,
  });
  configureApp(nestApp);
  await nestApp.listen(0, '127.0.0.1');
  app = nestApp;
  http = axios.create({ baseURL: await nestApp.getUrl() });

  mockUsersService();
  ada = await signUp('Ada');
  bob = await signUp('Bob');
});

beforeEach(() => {
  for (const client of [products, orders, buyers]) client.reset();
  users.send.mockClear();
});

afterAll(async () => {
  await app?.close();
});

describe('API gateway', () => {
  it('GET /api/health is public', async () => {
    const res = await http.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ status: 'ok' });
  });

  it("reads the signed-in seller's own account", async () => {
    const { data: me } = await ada.api.get('/api/users/me');

    expect(me).toEqual(ada.seller);
    expect(sent(users, UsersPatterns.FindOne)).toEqual([{ id: ada.seller.id }]);
  });

  it('creates records for the signed-in seller', async () => {
    products.reply(ProductsPatterns.Create, (payload) => ({
      id: randomUUID(),
      stock: 0,
      ...payload,
    }));

    const { status, data: product } = await ada.api.post('/api/products', {
      name: 'T-shirt',
      price: 25_000,
    });

    expect(status).toBe(201);
    expect(product).toMatchObject({ sellerId: ada.seller.id, name: 'T-shirt' });
    expect(sent(products, ProductsPatterns.Create)).toEqual([
      { name: 'T-shirt', price: 25_000, sellerId: ada.seller.id },
    ]);
  });

  it("scopes updates and filtered lists to the seller's records", async () => {
    const orderId = randomUUID();
    orders.reply(OrdersPatterns.Update, ({ id, changes }) => ({
      id,
      ...changes,
    }));
    orders.reply(OrdersPatterns.FindAll, () => ({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    }));

    await ada.api.patch(`/api/orders/${orderId}`, { status: 'confirmed' });
    await ada.api.get('/api/orders', { params: { status: 'confirmed' } });

    expect(sent(orders, OrdersPatterns.Update)).toEqual([
      {
        id: orderId,
        changes: { status: 'confirmed' },
        scope: { sellerId: ada.seller.id },
      },
    ]);
    expect(sent(orders, OrdersPatterns.FindAll)).toEqual([
      expect.objectContaining({
        where: { status: 'confirmed', sellerId: ada.seller.id },
      }),
    ]);
  });

  it('rejects an invalid payload with 400 before calling a service', async () => {
    const res = await http.post(
      '/api/auth/register',
      { name: '', email: 'not-an-email', password: PASSWORD },
      noThrow,
    );

    expect(res.status).toBe(400);
    expect(sent(users, UsersPatterns.Register)).toEqual([]);
  });

  it("maps a service's 404 to HTTP 404", async () => {
    products.reply(ProductsPatterns.FindOne, ({ id }) => {
      throw serviceError(404, `Product ${id} not found`);
    });

    const res = await ada.api.get(`/api/products/${MISSING_ID}`, noThrow);

    expect(res.status).toBe(404);
    expect(res.data.message).toBe(`Product ${MISSING_ID} not found`);
  });

  it("maps a service's 409 to HTTP 409 (duplicate email)", async () => {
    const res = await http.post(
      '/api/auth/register',
      { name: 'Ada again', email: ada.email, password: PASSWORD },
      noThrow,
    );

    expect(res.status).toBe(409);
  });

  it("maps a service's 400 to HTTP 400 (invalid status transition)", async () => {
    orders.reply(OrdersPatterns.Update, () => {
      throw serviceError(400, 'Cannot move an order from pending to delivered');
    });

    const res = await ada.api.patch(
      `/api/orders/${randomUUID()}`,
      { status: 'delivered' },
      noThrow,
    );

    expect(res.status).toBe(400);
  });

  it('hides internal details of service failures', async () => {
    products.reply(ProductsPatterns.FindAll, () => {
      throw serviceError(500, 'connection to db-internal:5432 refused');
    });

    const res = await ada.api.get('/api/products', noThrow);

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.data)).not.toContain('db-internal');
  });

  it('answers 503 when a service is unreachable', async () => {
    products.reply(ProductsPatterns.FindAll, () => {
      throw Object.assign(new Error('connect ECONNREFUSED'), {
        code: 'ECONNREFUSED',
      });
    });

    const res = await ada.api.get('/api/products', noThrow);

    expect(res.status).toBe(503);
  });
});

describe('authentication', () => {
  it('requires a session on every non-public route', async () => {
    for (const path of ['/api/users/me', '/api/products', '/api/orders']) {
      const res = await http.get(path, noThrow);
      expect(res.status).toBe(401);
    }
    expect(products.send).not.toHaveBeenCalled();
    expect(orders.send).not.toHaveBeenCalled();
  });

  it('signs in with the right password only, without revealing which part was wrong', async () => {
    const ok = await http.post('/api/auth/login', {
      email: ada.email,
      password: PASSWORD,
    });
    expect(ok.status).toBe(200);
    expect(sessionCookie(ok)).toMatch(/^session=.+/);

    const wrongPassword = await http.post(
      '/api/auth/login',
      { email: ada.email, password: 'wrong password' },
      noThrow,
    );
    const unknownEmail = await http.post(
      '/api/auth/login',
      { email: uniqueEmail('nobody'), password: PASSWORD },
      noThrow,
    );
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.data.message).toBe(unknownEmail.data.message);
  });

  it('sets an httpOnly session cookie and clears it on logout', async () => {
    const res = await http.post('/api/auth/register', {
      name: 'Cookie',
      email: uniqueEmail('cookie'),
      password: PASSWORD,
    });
    const setCookie = res.headers['set-cookie']?.join('\n') ?? '';
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);

    const logout = await http.post('/api/auth/logout', null, {
      headers: { Cookie: sessionCookie(res) },
    });
    expect(logout.status).toBe(204);
    expect(logout.headers['set-cookie']?.join('\n')).toMatch(
      /session=;.*Expires=Thu, 01 Jan 1970/i,
    );
  });

  it('rejects a forged token', async () => {
    const res = await http.get('/api/users/me', {
      ...noThrow,
      headers: { Authorization: 'Bearer abc.def.ghi' },
    });

    expect(res.status).toBe(401);
  });
});

describe('seller isolation', () => {
  it("asks services only for the caller's records", async () => {
    // The products-service mock owns one product, belonging to Ada.
    const productId = randomUUID();
    const ownedByCaller = ({ id, scope }: { id: string; scope: object }) => {
      if (
        id !== productId ||
        (scope as { sellerId?: string }).sellerId !== ada.seller.id
      ) {
        throw serviceError(404, `Product ${id} not found`);
      }
      return { id, sellerId: ada.seller.id, name: 'Tote' };
    };
    products.reply(ProductsPatterns.FindOne, ownedByCaller);
    products.reply(ProductsPatterns.Update, ownedByCaller);
    products.reply(ProductsPatterns.Remove, ownedByCaller);

    const responses = [
      await bob.api.get(`/api/products/${productId}`, noThrow),
      await bob.api.patch(`/api/products/${productId}`, { price: 1 }, noThrow),
      await bob.api.delete(`/api/products/${productId}`, noThrow),
    ];
    expect(responses.map((r) => r.status)).toEqual([404, 404, 404]);
    for (const payload of products.send.mock.calls.map(([, p]) => p)) {
      expect(payload).toMatchObject({ scope: { sellerId: bob.seller.id } });
    }

    const own = await ada.api.get(`/api/products/${productId}`);
    expect(own.data).toMatchObject({ sellerId: ada.seller.id });
  });

  it('sets sellerId from the session and refuses it in the body', async () => {
    products.reply(ProductsPatterns.Create, (payload) => ({
      id: randomUUID(),
      ...payload,
    }));

    const res = await bob.api.post(
      '/api/products',
      { name: 'Cap', price: 15_000, sellerId: ada.seller.id },
      noThrow,
    );
    expect(res.status).toBe(400);
    expect(sent(products, ProductsPatterns.Create)).toEqual([]);

    const { data: product } = await bob.api.post('/api/products', {
      name: 'Cap',
      price: 15_000,
    });
    expect(product.sellerId).toBe(bob.seller.id);
  });
});

describe('security', () => {
  it('sends security headers and hides the framework', async () => {
    const res = await http.get('/api/health');

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
    expect(products.send).not.toHaveBeenCalled();
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
    expect(orders.send).not.toHaveBeenCalled();
  });

  it('refuses cross-site writes (CSRF)', async () => {
    const res = await ada.api.post(
      '/api/products',
      { name: 'Evil', price: 1 },
      { ...noThrow, headers: { Origin: 'https://evil.example' } },
    );

    expect(res.status).toBe(403);
    expect(products.send).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies', async () => {
    const res = await http.post(
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
