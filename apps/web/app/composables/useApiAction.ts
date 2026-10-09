/**
 * Runs an API call and reports the outcome as a toast. Resolves `true` on
 * success; on failure shows the gateway's message and resolves `false`.
 *
 * ```ts
 * const run = useApiAction();
 * await run(() => products.remove(id), {
 *   success: 'Product deleted',
 *   error: 'Could not delete the product',
 * });
 * ```
 */
export function useApiAction() {
  const toast = useToast();

  return async function run(
    action: () => Promise<unknown>,
    messages: { success?: string; error: string },
  ): Promise<boolean> {
    try {
      await action();
      if (messages.success) {
        toast.add({
          title: messages.success,
          color: 'success',
          icon: 'i-lucide-circle-check',
        });
      }
      return true;
    } catch (error) {
      toast.add({
        title: messages.error,
        description: apiErrorMessage(error, '') || undefined,
        color: 'error',
        icon: 'i-lucide-circle-alert',
      });
      return false;
    }
  };
}
