<script setup lang="ts">
import type {
  CreateOrderPayload,
  Order,
  UpdateOrderPayload,
} from '@org/contracts';

definePageMeta({ middleware: 'seller' });
useHead({ title: 'Dashboard' });

const { sellerId, seller } = useActiveSeller();
// Stats from the latest 100 orders. A stats endpoint replaces this later.
const orders = useCrud<Order, CreateOrderPayload, UpdateOrderPayload>(
  'orders',
  () => ({ sellerId: sellerId.value ?? undefined, limit: 100 }),
);

const stats = computed(() => {
  const list = orders.items.value;
  const sum = (filter: (o: Order) => boolean) =>
    list.filter(filter).reduce((total, o) => total + o.total, 0);
  return {
    open: list.filter((o) =>
      ['pending', 'confirmed', 'shipped'].includes(o.status),
    ).length,
    delivered: sum((o) => o.status === 'delivered'),
    codToCollect: sum(
      (o) => o.paymentMethod === 'cod' && o.status === 'shipped',
    ),
    returned: list.filter((o) => o.status === 'returned').length,
  };
});

const recent = computed(() =>
  [...orders.items.value]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5),
);
</script>

<template>
  <section class="page">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p v-if="seller" class="lead">{{ seller.name }}</p>
      </div>
      <NuxtLink to="/orders/new" class="btn">New order</NuxtLink>
    </div>

    <p v-if="orders.error.value" class="error" role="alert">
      Could not load orders. Is the API running?
    </p>

    <div class="stats">
      <StatCard label="Open orders" :value="stats.open" />
      <StatCard label="Delivered sales" :value="formatPeso(stats.delivered)" />
      <StatCard
        label="COD to collect"
        :value="formatPeso(stats.codToCollect)"
        hint="Shipped COD orders"
      />
      <StatCard label="Returned" :value="stats.returned" hint="Lost to RTS" />
    </div>

    <div class="page-header">
      <h2>Recent orders</h2>
      <NuxtLink to="/orders" class="muted">View all</NuxtLink>
    </div>
    <p v-if="recent.length === 0" class="muted">No orders yet.</p>
    <ul v-else class="list">
      <li v-for="order in recent" :key="order.id">
        <OrderCard :order="order" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
}
</style>
