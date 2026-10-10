// A stand-in for the API gateway, so the web e2e tests run without the
// gateway or any microservice. It answers the endpoints the web app calls
// with the same shapes and status codes, keeping data in memory. Everything
// is scoped to the signed-in seller, like the real gateway.
//
// Usage: node apps/web-e2e/mock-api/server.mjs (MOCK_API_PORT, default 4301)
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_API_PORT ?? 4301);
const PAGE_SIZE = 20;

/** @type {Map<string, { user: object, password: string }>} by email */
const accounts = new Map();
/** @type {Map<string, string>} session token → user id */
const sessions = new Map();
const tables = { products: [], buyers: [], orders: [] };

const now = () => new Date().toISOString();

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    ...headers,
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

const error = (res, status, message) =>
  send(res, status, { statusCode: status, message });

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sellerId(req) {
  const token = /(?:^|;\s*)session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  return token ? sessions.get(token) : undefined;
}

function startSession(user) {
  const token = randomUUID();
  sessions.set(token, user.id);
  return { 'set-cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax` };
}

function orderTotals(body) {
  const items = body.items ?? [];
  const shippingFee = body.shippingFee ?? 0;
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  return { items, shippingFee, total: subtotal + shippingFee };
}

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  returned: [],
  cancelled: [],
};

async function handle(req, res) {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname.replace(/^\/api/, '');
  const method = req.method ?? 'GET';

  if (path === '/health') return send(res, 200, { status: 'ok' });

  // Auth
  if (method === 'POST' && path === '/auth/register') {
    const { name, email, password } = await readJson(req);
    if (!name || !email?.includes('@') || (password ?? '').length < 8) {
      return error(res, 400, 'Invalid sign-up details');
    }
    if (accounts.has(email)) {
      return error(res, 409, `Email ${email} is already registered`);
    }
    const user = {
      id: randomUUID(),
      name,
      email,
      createdAt: now(),
      updatedAt: now(),
    };
    accounts.set(email, { user, password });
    return send(res, 201, user, startSession(user));
  }
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = await readJson(req);
    const account = accounts.get(email);
    if (!account || account.password !== password) {
      return error(res, 401, 'Invalid email or password');
    }
    return send(res, 200, account.user, startSession(account.user));
  }
  if (method === 'POST' && path === '/auth/logout') {
    return send(res, 204, undefined, {
      'set-cookie':
        'session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    });
  }

  const seller = sellerId(req);
  if (!seller) return error(res, 401, 'Sign in required');

  if (path === '/users/me' && method === 'GET') {
    const account = [...accounts.values()].find((a) => a.user.id === seller);
    return account
      ? send(res, 200, account.user)
      : error(res, 401, 'Sign in required');
  }

  // CRUD: /products, /buyers, /orders and /:resource/:id
  const [, resource, id] = path.split('/');
  const table = tables[resource];
  if (!table) return error(res, 404, `Cannot ${method} ${url.pathname}`);
  const own = table.filter((r) => r.sellerId === seller);

  if (!id && method === 'GET') {
    const status = url.searchParams.get('status');
    const matching = own
      .filter((r) => !status || r.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = Number(url.searchParams.get('limit') ?? PAGE_SIZE);
    const page = Number(url.searchParams.get('page') ?? 1);
    const items = matching.slice((page - 1) * limit, page * limit);
    return send(res, 200, { items, total: matching.length, page, limit });
  }
  if (!id && method === 'POST') {
    const body = await readJson(req);
    if ('sellerId' in body)
      return error(res, 400, 'property sellerId should not exist');
    const record = {
      ...body,
      ...(resource === 'orders'
        ? { ...orderTotals(body), status: 'pending' }
        : {}),
      ...(resource === 'products' ? { stock: body.stock ?? 0 } : {}),
      id: randomUUID(),
      sellerId: seller,
      createdAt: now(),
      updatedAt: now(),
    };
    table.push(record);
    return send(res, 201, record);
  }

  const record = own.find((r) => r.id === id);
  if (!record)
    return error(res, 404, `${resource.slice(0, -1)} ${id} not found`);

  if (method === 'GET') return send(res, 200, record);
  if (method === 'PATCH') {
    const changes = await readJson(req);
    if (
      resource === 'orders' &&
      changes.status &&
      !TRANSITIONS[record.status].includes(changes.status)
    ) {
      return error(
        res,
        400,
        `Cannot move an order from ${record.status} to ${changes.status}`,
      );
    }
    Object.assign(record, changes, { updatedAt: now() });
    return send(res, 200, record);
  }
  if (method === 'DELETE') {
    table.splice(table.indexOf(record), 1);
    return send(res, 200, record);
  }
  return error(res, 404, `Cannot ${method} ${url.pathname}`);
}

createServer((req, res) => {
  handle(req, res).catch(() => error(res, 400, 'Malformed request'));
}).listen(PORT, 'localhost', () => {
  console.log(`Mock API listening on http://localhost:${PORT}/api`);
});
