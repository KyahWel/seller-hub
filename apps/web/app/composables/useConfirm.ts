import ConfirmDialog from '~/components/ConfirmDialog.vue';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

/**
 * Asks for confirmation in a modal. Resolves `false` when cancelled or
 * dismissed.
 *
 * ```ts
 * const confirm = useConfirm();
 * if (await confirm({ title: 'Delete product?', danger: true })) …
 * ```
 */
export function useConfirm() {
  const dialog = useOverlay().create(ConfirmDialog, { destroyOnClose: true });
  return async (options: ConfirmOptions): Promise<boolean> =>
    (await dialog.open(options).result) === true;
}
