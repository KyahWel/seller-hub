<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui';
import {
  ORDER_STATUS_TRANSITIONS,
  type Buyer,
  type Order,
  type OrderStatus,
  type UpdateOrderPayload,
} from '@org/contracts';

const route = useRoute();
const id = computed(() => String(route.params.id));
const run = useApiAction();
const confirm = useConfirm();

const {
  data: order,
  error,
  refresh,
} = useFetch<Order>(() => `/api/orders/${id.value}`);
// Forwards the session cookie during SSR, which plain `$fetch` does not.
const requestFetch = useRequestFetch();
const { data: buyer } = useAsyncData(
  () => `buyer:${order.value?.buyerId ?? 'none'}`,
  () =>
    order.value?.buyerId
      ? requestFetch<Buyer>(`/api/buyers/${order.value.buyerId}`).catch(
          () => null,
        )
      : Promise.resolve(null),
);

useHead({
  title: () =>
    order.value ? `Order ${formatPeso(order.value.total)}` : 'Order',
});

/** The happy path, shown as progress. Returned/cancelled end it early. */
const FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];
const STEP_ICONS: Record<string, string> = {
  pending: 'i-lucide-clock',
  confirmed: 'i-lucide-thumbs-up',
  shipped: 'i-lucide-truck',
  delivered: 'i-lucide-package-check',
};
const steps: StepperItem[] = FLOW.map((status) => ({
  value: status,
  title: ORDER_STATUS_LABELS[status],
  icon: STEP_ICONS[status],
}));
const onHappyPath = computed(
  () => !!order.value && FLOW.includes(order.value.status),
);

/** Forward moves are primary buttons; giving up on an order is secondary. */
const ENDINGS: OrderStatus[] = ['cancelled', 'returned'];
const nextStatuses = computed(() =>
  order.value ? ORDER_STATUS_TRANSITIONS[order.value.status] : [],
);
const forward = computed(() =>
  nextStatuses.value.filter((s) => !ENDINGS.includes(s)),
);
const endings = computed(() =>
  nextStatuses.value.filter((s) => ENDINGS.includes(s)),
);

const subtotal = computed(() =>
  order.value ? order.value.total - order.value.shippingFee : 0,
);
const saving = ref(false);

async function moveTo(status: OrderStatus) {
  if (ENDINGS.includes(status)) {
    const confirmed = await confirm({
      title: `Mark this order ${ORDER_STATUS_LABELS[status].toLowerCase()}?`,
      description: 'This can’t be undone.',
      confirmLabel: `Mark ${ORDER_STATUS_LABELS[status].toLowerCase()}`,
      danger: true,
    });
    if (!confirmed) return;
  }
  saving.value = true;
  await run(
    async () => {
      await $fetch<Order>(`/api/orders/${id.value}`, {
        method: 'PATCH',
        body: { status } satisfies UpdateOrderPayload,
      });
      await refresh();
    },
    {
      success: `Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}`,
      error: 'Could not update the order',
    },
  );
  saving.value = false;
}
</script>

<template>
  <PagePanel id="order" title="Order" back="/orders">
    <template v-if="order" #actions>
      <UButton
        v-for="status in endings"
        :key="status"
        :label="`Mark ${ORDER_STATUS_LABELS[status].toLowerCase()}`"
        color="neutral"
        variant="outline"
        :disabled="saving"
        class="hidden sm:inline-flex"
        @click="moveTo(status)"
      />
      <UButton
        v-for="status in forward"
        :key="status"
        :label="`Mark ${ORDER_STATUS_LABELS[status].toLowerCase()}`"
        :icon="STEP_ICONS[status]"
        :loading="saving"
        @click="moveTo(status)"
      />
    </template>

    <EmptyState
      v-if="error"
      icon="i-lucide-file-question"
      :title="
        error.statusCode === 404
          ? 'Order not found'
          : 'Could not load the order'
      "
      :description="
        error.statusCode === 404
          ? 'It may have been deleted, or it belongs to another account.'
          : 'Check that the API is running, then refresh.'
      "
    >
      <UButton
        to="/orders"
        label="Back to orders"
        color="neutral"
        variant="outline"
      />
    </EmptyState>

    <div v-else-if="order" class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-3xl font-semibold text-highlighted tabular-nums">
              {{ formatPeso(order.total) }}
            </h2>
            <StatusBadge :status="order.status" size="lg" />
          </div>
          <p
            class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"
          >
            <span class="flex items-center gap-1.5">
              <UIcon :name="CHANNEL_ICONS[order.channel]" class="size-4" />
              {{ CHANNEL_LABELS[order.channel] }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-wallet" class="size-4" />
              {{ PAYMENT_LABELS[order.paymentMethod] }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar" class="size-4" />
              {{ formatDate(order.createdAt) }}
            </span>
          </p>
        </div>
        <div v-if="endings.length" class="flex gap-2 sm:hidden">
          <UButton
            v-for="status in endings"
            :key="status"
            :label="`Mark ${ORDER_STATUS_LABELS[status].toLowerCase()}`"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="saving"
            @click="moveTo(status)"
          />
        </div>
      </div>

      <UCard v-if="onHappyPath">
        <UStepper
          :items="steps"
          :model-value="order.status"
          disabled
          size="sm"
          class="w-full"
        />
      </UCard>
      <UAlert
        v-else
        :color="order.status === 'returned' ? 'error' : 'neutral'"
        variant="subtle"
        :icon="order.status === 'returned' ? 'i-lucide-undo-2' : 'i-lucide-ban'"
        :title="
          order.status === 'returned'
            ? 'Returned to sender'
            : 'This order was cancelled'
        "
      />

      <div class="grid gap-6 lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="font-semibold text-highlighted">Items</h2>
          </template>
          <ul class="divide-y divide-default">
            <li
              v-for="(item, index) in order.items"
              :key="index"
              class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6"
            >
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">
                  {{ item.name }}
                </p>
                <p class="text-sm text-muted tabular-nums">
                  {{ item.quantity }} × {{ formatPeso(item.unitPrice) }}
                </p>
              </div>
              <p class="font-medium tabular-nums">
                {{ formatPeso(item.quantity * item.unitPrice) }}
              </p>
            </li>
          </ul>
          <template #footer>
            <dl class="ml-auto max-w-xs space-y-2 text-sm">
              <div class="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd class="tabular-nums">{{ formatPeso(subtotal) }}</dd>
              </div>
              <div class="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd class="tabular-nums">
                  {{ formatPeso(order.shippingFee) }}
                </dd>
              </div>
              <div
                class="flex justify-between border-t border-default pt-2 text-base font-semibold text-highlighted"
              >
                <dt>Total</dt>
                <dd class="tabular-nums">{{ formatPeso(order.total) }}</dd>
              </div>
            </dl>
          </template>
        </UCard>

        <div class="space-y-6">
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">Buyer</h2>
            </template>
            <div v-if="buyer" class="space-y-3 text-sm">
              <div class="flex items-center gap-3">
                <UAvatar :alt="buyer.name" />
                <p class="font-medium text-highlighted">{{ buyer.name }}</p>
              </div>
              <p class="flex items-center gap-2 text-muted">
                <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
                <a :href="`tel:${buyer.phone}`" class="hover:underline">
                  {{ buyer.phone }}
                </a>
              </p>
              <p v-if="buyer.address" class="flex gap-2 text-muted">
                <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0" />
                {{ buyer.address }}
              </p>
            </div>
            <p v-else class="text-sm text-muted">No buyer linked.</p>
          </UCard>

          <UCard v-if="order.notes">
            <template #header>
              <h2 class="font-semibold text-highlighted">Notes</h2>
            </template>
            <p class="text-sm whitespace-pre-line">{{ order.notes }}</p>
          </UCard>
        </div>
      </div>
    </div>
  </PagePanel>
</template>
