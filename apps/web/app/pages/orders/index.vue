<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@org/contracts';

useHead({ title: 'Orders' });

const route = useRoute();
const router = useRouter();

const status = computed(() => {
  const value = route.query.status;
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : undefined;
});
const page = computed(() => Math.max(1, Number(route.query.page) || 1));

const orders = useCrud<Order, never, never>('orders', () => ({
  status: status.value,
  page: page.value,
}));

const tabs: TabsItem[] = [
  { label: 'All', value: 'all' },
  ...ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
];

// The filter and page live in the URL, so they survive reloads and links.
const activeTab = computed({
  get: () => status.value ?? 'all',
  set: (value: string | number) =>
    router.push({
      query: {
        ...route.query,
        status: value === 'all' ? undefined : String(value),
        page: undefined,
      },
    }),
});

function goToPage(value: number) {
  router.push({ query: { ...route.query, page: value } });
}
</script>

<template>
  <PagePanel id="orders" title="Orders">
    <template #actions>
      <UButton to="/orders/new" icon="i-lucide-plus" label="New order" />
    </template>

    <template #toolbar>
      <USelect
        v-model="activeTab"
        :items="tabs"
        icon="i-lucide-filter"
        class="w-full sm:hidden"
        aria-label="Filter by status"
      />
      <UTabs
        v-model="activeTab"
        :items="tabs"
        :content="false"
        variant="link"
        size="sm"
        class="-mb-px hidden sm:flex"
      />
    </template>

    <UAlert
      v-if="orders.error.value"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load orders"
      description="Check that the API is running, then refresh."
    />

    <OrdersTable
      v-else
      :orders="orders.items.value"
      :loading="orders.status.value === 'pending'"
    >
      <template #empty>
        <EmptyState
          v-if="status"
          icon="i-lucide-filter-x"
          :title="`No ${ORDER_STATUS_LABELS[status].toLowerCase()} orders`"
        >
          <UButton
            label="Show all orders"
            color="neutral"
            variant="outline"
            @click="activeTab = 'all'"
          />
        </EmptyState>
        <EmptyState
          v-else
          icon="i-lucide-shopping-bag"
          title="No orders yet"
          description="Record orders from Messenger, Instagram, TikTok or marketplaces."
        >
          <UButton to="/orders/new" icon="i-lucide-plus" label="New order" />
        </EmptyState>
      </template>
    </OrdersTable>

    <div
      v-if="orders.page.value.total > orders.page.value.limit"
      class="flex items-center justify-between gap-3 border-t border-default pt-4"
    >
      <p class="text-sm text-muted">{{ orders.page.value.total }} orders</p>
      <UPagination
        :page="page"
        :total="orders.page.value.total"
        :items-per-page="orders.page.value.limit"
        @update:page="goToPage"
      />
    </div>
  </PagePanel>
</template>
