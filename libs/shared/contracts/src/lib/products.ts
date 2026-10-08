import { type BaseEntity, crudPatterns } from './common.js';

export const ProductsPatterns = {
  ...crudPatterns('products'),
} as const;

/** Amounts are integer centavos (₱1.00 = 100). */
export interface Product extends BaseEntity {
  sellerId: string;
  name: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
}

export interface CreateProductPayload {
  sellerId: string;
  name: string;
  sku?: string;
  price: number;
  cost?: number;
  stock?: number;
}

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, 'sellerId'>
>;
