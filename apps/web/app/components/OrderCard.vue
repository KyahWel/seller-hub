<script setup lang="ts">
import type { Order } from '@org/contracts';

const props = defineProps<{ order: Order }>();
const summary = computed(() =>
  props.order.items.map((item) => `${item.quantity}× ${item.name}`).join(', '),
);
</script>

<template>
  <NuxtLink :to="`/orders/${order.id}`" class="card order-card">
    <div class="top">
      <strong>{{ formatPeso(order.total) }}</strong>
      <StatusBadge :status="order.status" />
    </div>
    <p class="summary">{{ summary }}</p>
    <p class="meta">
      {{ CHANNEL_LABELS[order.channel] }} ·
      {{ PAYMENT_LABELS[order.paymentMethod] }} ·
      {{ formatDate(order.createdAt) }}
    </p>
  </NuxtLink>
</template>

<style scoped>
.order-card {
  display: grid;
  gap: 0.25rem;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
