import { type BaseEntity, crudPatterns } from './common.js';

export const OrdersPatterns = {
  ...crudPatterns('orders'),
} as const;

export const SALES_CHANNELS = [
  'facebook',
  'instagram',
  'tiktok',
  'shopee',
  'lazada',
  'other',
] as const;
export type SalesChannel = (typeof SALES_CHANNELS)[number];

export const PAYMENT_METHODS = [
  'cod',
  'gcash',
  'maya',
  'bank_transfer',
  'other',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Which statuses an order may move to from its current one. */
export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  returned: [],
  cancelled: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return from === to || ORDER_STATUS_TRANSITIONS[from].includes(to);
}

/** Amounts are integer centavos (₱1.00 = 100). */
export interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order extends BaseEntity {
  sellerId: string;
  buyerId?: string;
  channel: SalesChannel;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  shippingFee: number;
  /** Items subtotal plus shipping fee, computed by the orders service. */
  total: number;
  notes?: string;
}

export interface CreateOrderPayload {
  sellerId: string;
  buyerId?: string;
  channel: SalesChannel;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  shippingFee?: number;
  notes?: string;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  notes?: string;
}
