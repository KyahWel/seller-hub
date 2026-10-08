import type { OrderStatus, PaymentMethod, SalesChannel } from '@org/contracts';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const CHANNEL_LABELS: Record<SalesChannel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  shopee: 'Shopee',
  lazada: 'Lazada',
  other: 'Other',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'COD',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank transfer',
  other: 'Other',
};
