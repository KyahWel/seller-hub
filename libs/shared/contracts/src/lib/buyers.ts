import { type BaseEntity, crudPatterns } from './common.js';

export const BuyersPatterns = {
  ...crudPatterns('buyers'),
} as const;

/** A customer who ordered from a seller. Risk scoring builds on this later. */
export interface Buyer extends BaseEntity {
  sellerId: string;
  name: string;
  /** Philippine mobile number, e.g. `09171234567`. */
  phone: string;
  address?: string;
  notes?: string;
}

export interface CreateBuyerPayload {
  sellerId: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export type UpdateBuyerPayload = Partial<Omit<CreateBuyerPayload, 'sellerId'>>;
