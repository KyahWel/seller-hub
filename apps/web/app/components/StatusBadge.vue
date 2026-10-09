<script setup lang="ts">
import type { OrderStatus } from '@org/contracts';

defineProps<{ status: OrderStatus; size?: 'sm' | 'md' | 'lg' }>();
</script>

<template>
  <UBadge
    :color="ORDER_STATUS_COLORS[status]"
    variant="subtle"
    :size="size ?? 'md'"
    :label="ORDER_STATUS_LABELS[status]"
    class="whitespace-nowrap"
  />
</template>
