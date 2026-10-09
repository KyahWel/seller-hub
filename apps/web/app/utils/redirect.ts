/**
 * The `?redirect=` target after signing in, if it is a path on this site.
 * Anything else (`https://…`, `//evil.example`) falls back to the dashboard.
 */
export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string') return '/';
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return '/';
  }
  return value;
}
