<script setup lang="ts">
import type { Order, Product } from '@org/contracts';

useHead({ title: 'Dashboard' });

/** Stock at or below this shows in "Running low". */
const LOW_STOCK = 3;

const { seller } = useSession();
// Stats from the latest 100 orders. A stats endpoint replaces this (#11).
const orders = useCrud<Order, never, never>('orders', { limit: 100 });
const products = useCrud<Product, never, never>('products', { limit: 100 });

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
    .slice(0, 6),
);

const lowStock = computed(() =>
  products.items.value
    .filter((p) => p.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6),
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});
</script>

<template>
  <PagePanel id="dashboard" title="Dashboard">
    <template #actions>
      <UButton to="/orders/new" icon="i-lucide-plus" label="New order" />
    </template>

    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-semibold text-highlighted">
          {{ greeting }}<template v-if="seller">, {{ seller.name }}</template>
        </h2>
        <p class="mt-1 text-muted">Here’s how your store is doing.</p>
      </div>

      <UAlert
        v-if="orders.error.value"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Could not load orders"
        description="Check that the API is running, then refresh."
      />

      <div class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Open orders"
          :value="stats.open"
          icon="i-lucide-inbox"
          tone="info"
          to="/orders?status=pending"
        />
        <StatCard
          label="Delivered sales"
          :value="formatPeso(stats.delivered)"
          icon="i-lucide-banknote"
          tone="success"
          to="/orders?status=delivered"
        />
        <StatCard
          label="COD to collect"
          :value="formatPeso(stats.codToCollect)"
          icon="i-lucide-truck"
          tone="warning"
          hint="Shipped cash-on-delivery orders"
          to="/orders?status=shipped"
        />
        <StatCard
          label="Returned"
          :value="stats.returned"
          icon="i-lucide-undo-2"
          tone="error"
          hint="Lost to return-to-sender"
          to="/orders?status=returned"
        />
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <UCard class="xl:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-highlighted">Recent orders</h2>
              <UButton
                to="/orders"
                label="View all"
                trailing-icon="i-lucide-arrow-right"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </div>
          </template>
          <OrdersTable
            :orders="recent"
            :loading="orders.status.value === 'pending'"
            compact
            class="px-4 sm:px-0"
          >
            <template #empty>
              <EmptyState
                icon="i-lucide-shopping-bag"
                title="No orders yet"
                description="Record your first order from a chat or marketplace."
              >
                <UButton
                  to="/orders/new"
                  icon="i-lucide-plus"
                  label="New order"
                />
              </EmptyState>
            </template>
          </OrdersTable>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-highlighted">Running low</h2>
              <UButton
                to="/products"
                label="Products"
                trailing-icon="i-lucide-arrow-right"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </div>
          </template>
          <ul v-if="lowStock.length" class="space-y-3">
            <li
              v-for="product in lowStock"
              :key="product.id"
              class="flex items-center justify-between gap-3"
            >
              <span class="truncate text-sm">{{ product.name }}</span>
              <UBadge
                :color="product.stock === 0 ? 'error' : 'warning'"
                variant="subtle"
                :label="
                  product.stock === 0 ? 'Sold out' : `${product.stock} left`
                "
              />
            </li>
          </ul>
          <p v-else class="text-sm text-muted">Everything is well stocked.</p>
        </UCard>
      </div>
    </div>
  </PagePanel>
</template>
