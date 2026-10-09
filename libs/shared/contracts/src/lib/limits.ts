/**
 * Input limits shared by the gateway's validation and the web forms.
 *
 * The numeric bounds keep totals far below Number.MAX_SAFE_INTEGER, so
 * crafted input cannot overflow the arithmetic in the services.
 */
export const MAX_ITEMS_PER_ORDER = 100;
export const MAX_QUANTITY = 10_000;
/** ₱10,000,000 in centavos. */
export const MAX_AMOUNT = 1_000_000_000;

/** Philippine mobile number: `09XXXXXXXXX` or `+639XXXXXXXXX`. */
export const PH_MOBILE_PATTERN = /^(09|\+639)\d{9}$/;
