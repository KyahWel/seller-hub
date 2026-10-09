/**
 * Form schemas. Inputs are the strings the fields hold; outputs are the
 * payloads the gateway accepts (amounts in integer centavos). Limits mirror
 * the gateway's DTOs through `@org/contracts`.
 */
import {
  MAX_AMOUNT,
  MAX_ITEMS_PER_ORDER,
  MAX_QUANTITY,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PAYMENT_METHODS,
  PH_MOBILE_PATTERN,
  SALES_CHANNELS,
} from '@org/contracts';
import { z } from 'zod';
import { toCentavos } from './format';

const PESOS = /^\d+(\.\d{1,2})?$/;
const PESOS_MESSAGE = 'Enter an amount like 199 or 199.50';

/** A peso amount typed as text, e.g. `"199.50"` → `19950`. */
export const pesos = z
  .string()
  .trim()
  .regex(PESOS, PESOS_MESSAGE)
  .transform((value) => toCentavos(Number(value)))
  .refine((centavos) => centavos <= MAX_AMOUNT, 'Amount is too large');

/** Like `pesos`, but empty means "not set". */
export const optionalPesos = z
  .string()
  .trim()
  .refine((value) => value === '' || PESOS.test(value), PESOS_MESSAGE)
  .transform((value) => (value === '' ? undefined : toCentavos(Number(value))))
  .refine(
    (centavos) => centavos === undefined || centavos <= MAX_AMOUNT,
    'Amount is too large',
  );

const wholeNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number')
    .transform(Number)
    .refine(
      (value) => value >= min && value <= max,
      `Enter ${min} to ${max.toLocaleString('en-PH')}`,
    );

const requiredText = (max: number, message = 'Required') =>
  z.string().trim().min(1, message).max(max);

/** Empty becomes `undefined`, so the field is left out of the payload. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined);

/** Trimmed first, so stray spaces from autofill don't fail validation. */
const email = z.string().trim().pipe(z.email('Enter a valid email'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX_LENGTH),
});

export const registerSchema = z.object({
  name: requiredText(100, 'Enter your store or seller name'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH),
});

export const productSchema = z.object({
  name: requiredText(200, 'Enter a product name'),
  sku: optionalText(64),
  price: pesos,
  cost: optionalPesos,
  stock: wholeNumber(0, MAX_QUANTITY),
});
export type ProductFormState = z.input<typeof productSchema>;
export type ProductFormValue = z.output<typeof productSchema>;

export const buyerSchema = z.object({
  name: requiredText(100, 'Enter the buyer’s name'),
  phone: z
    .string()
    .trim()
    .regex(PH_MOBILE_PATTERN, 'Use 09XXXXXXXXX or +639XXXXXXXXX'),
  address: optionalText(500),
  notes: optionalText(1000),
});
export type BuyerFormState = z.input<typeof buyerSchema>;
export type BuyerFormValue = z.output<typeof buyerSchema>;

export const orderItemSchema = z.object({
  productId: optionalText(64),
  name: requiredText(200, 'Enter an item name'),
  quantity: wholeNumber(1, MAX_QUANTITY),
  unitPrice: pesos,
});

export const orderSchema = z.object({
  channel: z.enum(SALES_CHANNELS),
  paymentMethod: z.enum(PAYMENT_METHODS),
  // Cleared select menus give `null`.
  buyerId: z
    .string()
    .nullish()
    .transform((value) => value || undefined),
  items: z
    .array(orderItemSchema)
    .min(1, 'Add at least one item')
    .max(MAX_ITEMS_PER_ORDER, `At most ${MAX_ITEMS_PER_ORDER} items`),
  shippingFee: optionalPesos,
  notes: optionalText(1000),
});
export type OrderItemFormState = z.input<typeof orderItemSchema>;
export type OrderFormState = z.input<typeof orderSchema>;
export type OrderFormValue = z.output<typeof orderSchema>;

/**
 * `validate-on` for every form. Leaving out `blur`/`change` matters: an
 * error that appears on blur moves the submit button between mousedown and
 * mouseup, so clicking "Save" right after typing misses the button.
 */
export const FORM_VALIDATE_ON: ('input' | 'blur' | 'change')[] = ['input'];
