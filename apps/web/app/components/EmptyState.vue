<script setup lang="ts">
/** Shown in place of an empty list. Put call-to-action buttons in the slot. */
defineProps<{ icon: string; title: string; description?: string }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 py-12 text-center"
  >
    <span class="rounded-full bg-elevated p-3 ring ring-default">
      <UIcon :name="icon" class="block size-6 text-muted" />
    </span>
    <div class="space-y-1">
      <p class="font-medium text-highlighted">{{ title }}</p>
      <p v-if="description" class="max-w-sm text-sm text-muted">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="flex gap-2">
      <slot />
    </div>
  </div>
</template>
