<script setup lang="ts">
/** Brand mark. `collapsed` hides the name (narrow sidebar). */
defineProps<{ collapsed?: boolean }>();
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2.5 font-semibold">
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted shadow-sm"
    >
      <UIcon name="i-lucide-store" class="size-4.5" />
    </span>
    <span v-if="!collapsed" class="truncate text-highlighted">Seller Hub</span>
  </NuxtLink>
</template>
