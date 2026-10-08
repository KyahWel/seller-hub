<script setup lang="ts">
import {
  ORDER_STATUS_TRANSITIONS,
  type Buyer,
  type Order,
  type OrderStatus,
  type UpdateOrderPayload,
} from '@org/contracts';

definePageMeta({ middleware: 'seller' });

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: order,
  error,
  refresh,
} = useFetch<Order>(() => `/api/orders/${id.value}`);
const { data: buyer } = useAsyncData(
  () => `buyer:${order.value?.buyerId ?? 'none'}`,
  () =>
    order.value?.buyerId
      ? $fetch<Buyer>(`/api/buyers/${order.value.buyerId}`).catch(() => null)
      : Promise.resolve(null),
);

useHead({
  title: () =>
    order.value ? `Order ${formatPeso(order.value.total)}` : 'Order',
});

const nextStatuses = computed(() =>
  order.value ? ORDER_STATUS_TRANSITIONS[order.value.status] : [],
);
const subtotal = computed(() =>
  order.value ? order.value.total - order.value.shippingFee : 0,
);
const actionError = ref<string | null>(null);
const saving = ref(false);

async function moveTo(status: OrderStatus) {
  actionError.value = null;
  saving.value = true;
  try {
    await $fetch<Order>(`/api/orders/${id.value}`, {
      method: 'PATCH',
      body: { status } satisfies UpdateOrderPayload,
    });
    await refresh();
  } catch (e) {
    actionError.value = apiErrorMessage(e, 'Could not update the order.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="page">
    <NuxtLink to="/orders" class="muted">← Orders</NuxtLink>

    <p v-if="error" class="error" role="alert">
      {{
        error.statusCode === 404
          ? 'Order not found.'
          : 'Could not load the order.'
      }}
    </p>

    <template v-else-if="order">
      <div class="page-header">
        <h1>{{ formatPeso(order.total) }}</h1>
        <StatusBadge :status="order.status" />
      </div>
      <p class="muted">
        {{ CHANNEL_LABELS[order.channel] }} ·
        {{ PAYMENT_LABELS[order.paymentMethod] }} ·
        {{ formatDate(order.createdAt) }}
      </p>

      <div v-if="nextStatuses.length" class="actions">
        <button
          v-for="status in nextStatuses"
          :key="status"
          type="button"
          class="btn"
          :class="{
            'btn-secondary': status === 'cancelled' || status === 'returned',
          }"
          :disabled="saving"
          @click="moveTo(status)"
        >
          Mark {{ ORDER_STATUS_LABELS[status].toLowerCase() }}
        </button>
      </div>
      <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>

      <div class="card">
        <h2>Buyer</h2>
        <p v-if="buyer">
          {{ buyer.name }} · {{ buyer.phone }}
          <span v-if="buyer.address" class="muted"
            ><br />{{ buyer.address }}</span
          >
        </p>
        <p v-else class="muted">No buyer linked.</p>
      </div>

      <div class="card">
        <h2>Items</h2>
        <table>
          <tbody>
            <tr v-for="(item, index) in order.items" :key="index">
              <td>{{ item.quantity }}× {{ item.name }}</td>
              <td class="amount">
                {{ formatPeso(item.quantity * item.unitPrice) }}
              </td>
            </tr>
            <tr class="muted">
              <td>Subtotal</td>
              <td class="amount">{{ formatPeso(subtotal) }}</td>
            </tr>
            <tr class="muted">
              <td>Shipping</td>
              <td class="amount">{{ formatPeso(order.shippingFee) }}</td>
            </tr>
            <tr class="total">
              <td>Total</td>
              <td class="amount">{{ formatPeso(order.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="order.notes" class="card">
        <h2>Notes</h2>
        <p>{{ order.notes }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card {
  display: grid;
  gap: 0.5rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

td {
  padding: 0.375rem 0;
  border-top: 1px solid var(--border);
}

.amount {
  text-align: right;
  white-space: nowrap;
}

.total {
  font-weight: 700;
}
</style>
