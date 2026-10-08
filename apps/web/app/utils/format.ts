export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amount,
  );
}

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

/** Formats integer centavos as pesos, e.g. `123450` → `₱1,234.50`. */
export function formatPeso(centavos: number): string {
  return peso.format(centavos / 100);
}

/** Converts a peso amount typed by a user to integer centavos. */
export function toCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

export function toPesos(centavos: number): number {
  return centavos / 100;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
