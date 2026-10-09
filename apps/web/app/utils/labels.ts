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

/** Badge colour per status: in progress, done, or lost. */
export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral'
> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'primary',
  delivered: 'success',
  returned: 'error',
  cancelled: 'neutral',
};

export const CHANNEL_ICONS: Record<SalesChannel, string> = {
  facebook: 'i-lucide-facebook',
  instagram: 'i-lucide-instagram',
  tiktok: 'i-lucide-music-2',
  shopee: 'i-lucide-shopping-cart',
  lazada: 'i-lucide-shopping-basket',
  other: 'i-lucide-globe',
};
