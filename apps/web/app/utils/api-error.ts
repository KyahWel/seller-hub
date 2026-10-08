/**
 * Extracts a readable message from a `$fetch` error. The gateway returns
 * `{ message: string | string[] }` (class-validator returns an array).
 */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  const message = (error as { data?: { message?: unknown } } | null)?.data
    ?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return fallback;
}
