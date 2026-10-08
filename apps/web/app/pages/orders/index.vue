<script setup lang="ts">
import {
  ORDER_STATUSES,
  type CreateOrderPayload,
  type Order,
  type OrderStatus,
  type UpdateOrderPayload,
} from '@org/contracts';

definePageMeta({ middleware: 'seller' });
useHead({ title: 'Orders' });

const route = useRoute();
const router = useRouter();
const { sellerId } = useActiveSeller();

const status = computed(() => {
  const value = route.query.status;
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : undefined;
});
const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const orders = useCrud<Order, CreateOrderPayload, UpdateOrderPayload>(
  'orders',
  () => ({
    sellerId: sellerId.value ?? undefined,
    status: status.value,
    page: page.value,
  }),
);

const pageCount = computed(() => {
  const { total, limit } = orders.page.value;
  return limit ? Math.max(1, Math.ceil(total / limit)) : 1;
});

function setStatus(value?: OrderStatus) {
  router.push({ query: { ...route.query, status: value, page: undefined } });
}

function goToPage(value: number) {
  router.push({ query: { ...route.query, page: value } });
}
</script>

<template>
  <section class="page">
    <div class="page-header">
      <h1>Orders</h1>
      <NuxtLink to="/orders/new" class="btn">New order</NuxtLink>
    </div>

    <div class="filters" role="group" aria-label="Filter by status">
      <button
        type="button"
        class="chip"
        :class="{ active: !status }"
        @click="setStatus()"
      >
        All
      </button>
      <button
        v-for="s in ORDER_STATUSES"
        :key="s"
        type="button"
        class="chip"
        :class="{ active: status === s }"
        @click="setStatus(s)"
      >
        {{ ORDER_STATUS_LABELS[s] }}
      </button>
    </div>

    <p v-if="orders.status.value === 'pending'">Loading…</p>
    <p v-else-if="orders.error.value" class="error" role="alert">
      Could not load orders. Is the API running?
    </p>
    <p v-else-if="orders.items.value.length === 0" class="muted">
      No orders{{
        status ? ` with status ${ORDER_STATUS_LABELS[status]}` : ''
      }}.
    </p>
    <ul v-else class="list">
      <li v-for="order in orders.items.value" :key="order.id">
        <OrderCard :order="order" />
      </li>
    </ul>

    <div v-if="pageCount > 1" class="pager">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      >
        Previous
      </button>
      <span class="muted">Page {{ page }} of {{ pageCount }}</span>
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="page >= pageCount"
        @click="goToPage(page + 1)"
      >
        Next
      </button>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.chip {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: inherit;
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
}

.chip.active {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
