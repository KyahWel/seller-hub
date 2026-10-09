<script setup lang="ts">
import type { Buyer, Order, Product } from '@org/contracts';
import type { OrderFormValue } from '~/utils/schemas';

useHead({ title: 'New order' });

const products = useCrud<Product, never, never>('products', { limit: 100 });
const buyers = useCrud<Buyer, never, never>('buyers', { limit: 100 });
const run = useApiAction();
const saving = ref(false);

async function onSubmit(value: OrderFormValue) {
  saving.value = true;
  let order: Order | undefined;
  await run(
    async () => {
      order = await $fetch<Order>('/api/orders', {
        method: 'POST',
        body: value,
      });
    },
    { success: 'Order saved', error: 'Could not save the order' },
  );
  saving.value = false;
  if (order) await navigateTo(`/orders/${order.id}`);
}
</script>

<template>
  <PagePanel id="new-order" title="New order" back="/orders">
    <OrderForm
      :products="products.items.value"
      :buyers="buyers.items.value"
      :loading="saving"
      @submit="onSubmit"
    />
  </PagePanel>
</template>
