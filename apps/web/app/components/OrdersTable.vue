<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Order } from '@org/contracts';

/**
 * Orders list; a row opens the order. A table on wider screens and a
 * stacked list on phones. `compact` drops the date column for narrow
 * containers. Pass `#empty` to replace the empty state.
 */
const props = defineProps<{
  orders: Order[];
  loading?: boolean;
  compact?: boolean;
}>();

const hideBelowLg = { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' };

const columns = computed<TableColumn<Order>[]>(() => [
  { accessorKey: 'items', header: 'Order' },
  {
    accessorKey: 'channel',
    header: 'Channel',
    meta: { class: hideBelowLg },
  },
  { accessorKey: 'status', header: 'Status' },
  ...(props.compact
    ? []
    : [
        {
          accessorKey: 'createdAt',
          header: 'Date',
          meta: { class: hideBelowLg },
        } satisfies TableColumn<Order>,
      ]),
  {
    accessorKey: 'total',
    header: () => h('span', { class: 'block text-right' }, 'Total'),
  },
]);

function summary(order: Order): string {
  return order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ');
}
</script>

<template>
  <div>
    <!-- Phones -->
    <ul v-if="orders.length" class="divide-y divide-default sm:hidden">
      <li v-for="order in orders" :key="order.id">
        <NuxtLink
          :to="`/orders/${order.id}`"
          class="flex items-start justify-between gap-3 px-1 py-3"
        >
          <div class="min-w-0">
            <p class="truncate font-medium text-highlighted">
              {{ summary(order) }}
            </p>
            <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <UIcon :name="CHANNEL_ICONS[order.channel]" class="size-3.5" />
              {{ PAYMENT_LABELS[order.paymentMethod] }} ·
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <span class="font-medium text-highlighted tabular-nums">
              {{ formatPeso(order.total) }}
            </span>
            <StatusBadge :status="order.status" size="sm" />
          </div>
        </NuxtLink>
      </li>
    </ul>
    <div
      v-else-if="loading"
      class="flex justify-center py-12 sm:hidden"
      aria-busy="true"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin text-muted"
      />
    </div>
    <div v-else class="sm:hidden">
      <slot name="empty">
        <EmptyState icon="i-lucide-shopping-bag" title="No orders yet" />
      </slot>
    </div>

    <!-- Tablets and up -->
    <UTable
      :data="orders"
      :columns="columns"
      :loading="loading"
      class="hidden sm:block"
      @select="(_event, row) => navigateTo(`/orders/${row.original.id}`)"
    >
      <template #items-cell="{ row }">
        <NuxtLink
          :to="`/orders/${row.original.id}`"
          class="block max-w-60 truncate font-medium text-highlighted hover:underline lg:max-w-sm"
          @click.stop
        >
          {{ summary(row.original) }}
        </NuxtLink>
        <span class="text-xs text-muted">
          {{ PAYMENT_LABELS[row.original.paymentMethod] }}
        </span>
      </template>
      <template #channel-cell="{ row }">
        <span class="flex items-center gap-1.5 text-muted">
          <UIcon :name="CHANNEL_ICONS[row.original.channel]" class="size-4" />
          {{ CHANNEL_LABELS[row.original.channel] }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <StatusBadge :status="row.original.status" />
      </template>
      <template #createdAt-cell="{ row }">
        <span class="whitespace-nowrap text-muted">
          {{ formatDate(row.original.createdAt) }}
        </span>
      </template>
      <template #total-cell="{ row }">
        <span
          class="block text-right font-medium text-highlighted tabular-nums"
        >
          {{ formatPeso(row.original.total) }}
        </span>
      </template>
      <template #empty>
        <slot name="empty">
          <EmptyState icon="i-lucide-shopping-bag" title="No orders yet" />
        </slot>
      </template>
    </UTable>
  </div>
</template>
