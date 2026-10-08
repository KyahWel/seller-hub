<script setup lang="ts">
import type { OrderStatus } from '@org/contracts';

defineProps<{ status: OrderStatus }>();
</script>

<template>
  <span class="badge" :class="`badge-${status}`">
    {{ ORDER_STATUS_LABELS[status] }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--border);
  white-space: nowrap;
}

.badge-confirmed,
.badge-shipped {
  background: #dbeafe;
  color: #1e40af;
}

.badge-delivered {
  background: #dcfce7;
  color: #166534;
}

.badge-returned,
.badge-cancelled {
  background: #fee2e2;
  color: #991b1b;
}
</style>
