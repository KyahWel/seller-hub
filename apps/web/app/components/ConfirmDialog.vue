<script setup lang="ts">
/** Opened through `useConfirm()`; emits `close` with the answer. */
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    confirmLabel?: string;
    danger?: boolean;
  }>(),
  { confirmLabel: 'Confirm' },
);
const emit = defineEmits<{ close: [confirmed: boolean] }>();
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :close="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emit('close', false)"
      />
      <UButton
        :label="confirmLabel"
        :color="danger ? 'error' : 'primary'"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
